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


const APPNAME_DIALOG = 'appNameDialog';


const dotenv = require('dotenv');
dotenv.config();

var appdLink=process.env.appdLink;
var appdUserName=process.env.appdUserName;
var appdPassword=process.env.appdPassword;

var inputApp='';
var info='';
var totalApp='';
var appList = new Array();

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class ReportsDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'reportsDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new AppNameDialog(APPNAME_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.quesStep.bind(this),
                this.appStep.bind(this),
                this.actionStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)    
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }
    async quesStep(step)
    {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please choose the Report u want to know.',
            choices: ChoiceFactory.toChoices(['All App agent Version','Main Menu','BACK'])
              });

    }

    async appStep(step)
    {
        info= step.result.value;
        if(info=='Main Menu'||info=='BACK')
        {
            return await step.next();
        }
        else
        {
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
            appList[i]=totalApp[i].name;
            }
            return await step.next();
        }    
    }

    async actionStep(step)
    {
        inputApp=step.result;

        if(info=='All App agent Version')
        {   
            for(var i=0;i<appList.length;i++)
            {
                await axios.get(`${appdLink}/controller/rest/applications/${appList[i]}/nodes?output=json`,
                {
                    auth:
                    {
                         username: appdUserName,
                        password: appdPassword
                    }
                }).then((result) => 
                     {  
                         step.context.sendActivity("App Name :"+ appList[i]);
                          step.context.sendActivity("App agent version: " + result.data[0].appAgentVersion);
                          step.context.sendActivity("machine agent version :" + result.data[0].machineAgentVersion);
                    });
            }
            await axios.get(`${appdLink}//controller/rest/applications/_dbmon/nodes?output=json`,
            {
                auth:
                {
                     username: appdUserName,
                    password: appdPassword
                }
            }).then((result) =>
            {
                for(var i=0;i<result.data.length;i++)
                {
                    step.context.sendActivity('Db agent name is :'+ result.data[i].name+' and its version is: '+result.data[i].appAgentVersion);
                    
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
      
      
    
  }
  async confirmStep(step)
  {
      return await step.prompt(CHOICE_PROMPT, {
          prompt: 'Any more Info about Reports?',
          choices: ChoiceFactory.toChoices(['yes', 'no'])
      });
  } 

  async finalStep(step)
  {
      if(step.result.value=='yes')
      {
         return await step.beginDialog('reportsDialog');
      }
      else
      {   
          step.context.sendActivity('Bye');
          return await step.endDialog();
      }
  } 

   }

module.exports.ReportsDialog = ReportsDialog;
