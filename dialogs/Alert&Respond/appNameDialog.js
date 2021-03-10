// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { InputHints, MessageFactory } = require('botbuilder');
const axios=require('axios');
const {
    AttachmentPrompt,
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');



const dotenv = require('dotenv');
dotenv.config();

var appdLink=process.env.appdLink;
var appdUserName=process.env.appdUserName;
var appdPassword=process.env.appdPassword;

var totalApp='';
var inputApp='';
var arr=[];

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class AppNameDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'appNameDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.appStep.bind(this),
                this.appCheckStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async appStep(step) {
            
        await axios.get(`${appdLink}/controller/rest/applications?output=json`,
        {
          auth:
          {
            username: appdUserName,
            password: appdPassword
          }
        }).then((result) =>{   
         totalApp=result.data;
        });  
        
        for(var i=0;i<totalApp.length;i++)
        {
          arr[i]=totalApp[i].name;
        }
     
        
          return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please select the Application name',
            choices: ChoiceFactory.toChoices(arr)
              });
    }

    async appCheckStep(step)
    {
        var flag=-1;
        inputApp=step.result.value;
        for(var i=0;i<totalApp.length;i++)
        {
          if(totalApp[i].name==inputApp)
          {
            flag=1;
            break;
          }
        } 
        if(flag==-1)
        {
          step.context.sendActivity('Sorry! You entered wrong name');
          return await step.beginDialog('appNameDialog');
        }
        else{
            return await step.endDialog(inputApp);
        }

    }
   }

module.exports.AppNameDialog = AppNameDialog;
