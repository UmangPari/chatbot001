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
const { TimeRangeDialog }=require('./timeRangeDialog');
const { AppNameDialog }=require('./appNameDialog');

const APPNAME_DIALOG = 'appNameDialog';
const TIMERANGE_DIALOG='timeRangeDialog';

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';


const dotenv = require('dotenv');
dotenv.config();

var appdLink=process.env.appdLink;
var appdUserName=process.env.appdUserName;
var appdPassword=process.env.appdPassword;

var inputApp='aa';
var appId;
var info='';
var totalApp='';
var startRange='0';
var endRange='0';
var finalRange='';
var timeRangeFlag=-1;
var appTier='';

class HealthRulesDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'healthRulesDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new TimeRangeDialog(TIMERANGE_DIALOG))
            .addDialog(new AppNameDialog(APPNAME_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                
                this.appStep.bind(this),
                this.appIdStep.bind(this),
                this.questionStep.bind(this),
                this.timeRangeStep.bind(this),
                this.actionStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

  
    async appStep(step) {
     
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
  
    async questionStep(step)
    {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'please chooose from following:',
            choices: ChoiceFactory.toChoices(['All Health Violations', 'Show All Health Rules','Main Menu','BACK'])
        });
    }
    async timeRangeStep(step)
    {
      info=step.result.value;
     if(info=='All Health Violations')
      {
        timeRangeFlag=1; 
        return await step.beginDialog(TIMERANGE_DIALOG, {range : finalRange});
      }
      
      return await step.next();
    }
    async actionStep(step)
    {
      if(timeRangeFlag==1)
      {
        startRange = step.result.split(" ")[0];
        endRange = step.result.split(" ")[1];   
        timeRangeFlag=-1;
      }
      
        if(info=='All Health Violations')
        {
            await axios.get(`${appdLink}/controller/rest/applications/${inputApp}/problems/healthrule-violations?time-range-type=BEFORE_NOW&duration-in-mins=${startRange}&output=json`,
            {               
              auth:
                {
                  username: appdUserName,
                  password: appdPassword
                }
            }).then((result) =>{
                for(var i=0;i<result.data.length;i++)
                {
                    step.context.sendActivity(result.data[i].description);
                }
            });
        }
        else if(info=='Show All Health Rules')
        {
          await axios.get(`${appdLink}/controller/alerting/rest/v1/applications/${appId}/health-rules`,
            {               
              auth:
                {
                  username: appdUserName,
                  password: appdPassword
                }
            }).then((result) =>{
                for(var i=0;i<result.data.length;i++)
                {
                    step.context.sendActivity(result.data[i].name);
                }
            });
        }
        else if(info=='Main Menu')
        {
          return await step.endDialog(0);
        }
        else if(info=='BACK')
        {
          return await step.endDialog(1);
        }

        return await step.next();
    }
    async confirmStep(step)
  {
      return await step.prompt(CHOICE_PROMPT, {
          prompt: 'Any more Info about Health Rules?',
          choices: ChoiceFactory.toChoices(['yes', 'no'])
      });
  } 

  async finalStep(step)
  {
      if(step.result.value=='yes')
      {
         return await step.beginDialog('healthRulesDialog',{app:inputApp});
      }
      else
      {   
          step.context.sendActivity('Bye');
          return await step.endDialog();
      }
  } 
   }

module.exports.HealthRulesDialog = HealthRulesDialog;
