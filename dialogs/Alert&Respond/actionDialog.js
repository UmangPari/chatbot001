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
const { AppNameDialog }=require('./appNameDialog');

const APPNAME_DIALOG='./appNameDialog';
const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

const dotenv = require('dotenv');
dotenv.config();

var appdLink=process.env.appdLink;
var appdUserName=process.env.appdUserName;
var appdPassword=process.env.appdPassword;

var appId,info,inputApp;

class ActionDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'actionDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new AppNameDialog(APPNAME_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                
                this.appNameStep.bind(this),
                this.appIdStep.bind(this),
                this.choiceStep.bind(this),
                this.actionStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

 
    async appNameStep(step)
    {
        inputApp=step.options;
        inputApp=inputApp.app;
        return await step.next();
        
    }
    async appIdStep(step)
    {
                   
            await axios.get(`${appdLink}/controller/rest/applications/${inputApp}?output=json`,
            {
            auth:
            {
                username: appdUserName,
                password: appdPassword
            }
            }).then((result) =>{   
                appId=result.data[0].id;
            });   
            return await step.next();
     
    }
    async choiceStep(step)
    {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Hi! How can I help u with?',
            choices: ChoiceFactory.toChoices(['Show all Actions','Main Menu','BACK'])
        });
    }
    async actionStep(step)
    {
        info=step.result.value;
        if(info=='Show all Actions')
        {
            await axios.get(`${appdLink}/controller/alerting/rest/v1/applications/${appId}/actions`,
            {
                auth:
                {
                username: appdUserName,
                password: appdPassword
                }
            }).then((result) =>{   
            var outerData=result.data;
                for(var i=0;i<outerData.length;i++)
                {
                    step.context.sendActivity(outerData[i].actionType);
                    step.context.sendActivity(outerData[i].name);
                }    
            });
            return await step.next();
        }    
        else if(info=='Main Menu')
        {
            return await step.endDialog(0);
        }
        else if(info=='BACK')
        {
            return await step.endDialog(1);
        }
        else {
            return await step.next();
        }
         
  }
  async confirmStep(step)
  {
      
      return await step.prompt(CHOICE_PROMPT, {
          prompt: 'Any more Info about Action?',
          choices: ChoiceFactory.toChoices(['yes', 'no'])
      });
  } 

  async finalStep(step)
  {
      if(step.result.value=='yes')
      {
         return await step.beginDialog('actionDialog',{app:inputApp});
      }
      else
      {   
          step.context.sendActivity('Bye');
          return await step.endDialog();
      }
  } 
   }

module.exports.ActionDialog = ActionDialog;
