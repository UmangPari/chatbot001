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

var info;

const dotenv = require('dotenv');
dotenv.config();

var appdLink=process.env.appdLink;
var appdUserName=process.env.appdUserName;
var appdPassword=process.env.appdPassword;

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class ServerDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'serverDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.choiceStep.bind(this),
                this.actionStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }
    async choiceStep(step)
    {   
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please choose the following actions',
            choices: ChoiceFactory.toChoices(['CPU %Busy','Memory Free%','Memory Used%','Network Incoming Errors','Network Outgoing Errors','Main Menu','BACK'])
        });
       }
    async actionStep(step)
    {
        info=step.result.value;
      if(info=='CPU %Busy')
      {
        await axios.get(`${appdLink}/controller/rest/applications/Server%20&%20Infrastructure%20Monitoring/metric-data?metric-path=Application%20Infrastructure%20Performance%7CRoot%7CIndividual%20Nodes%7CDESKTOP-2ONQ4R7%7CHardware%20Resources%7CCPU%7C%25Busy&time-range-type=BEFORE_NOW&duration-in-mins=1440&output=json`,
        {
            auth:
            {
            username: appdUserName,
            password: appdPassword
            }
        }).then((result) =>{   
        var outerData=result.data;
        if(outerData.length==0)
        {
            step.context.sendActivity('No data found');
        }
        else
        {
             step.context.sendActivity(outerData[0].metricValues[0].values);
        }   
        });
        return await step.next();
      }
   /*   else if(info=='(Disk)')
      {
        step.context.sendActivity('Work in Progress');
        return await step.next();
      }*/
      else if(info=='Memory Free%')
      {
        
        await axios.get(`${appdLink}/controller/rest/applications/Server%20&%20Infrastructure%20Monitoring/metric-data?metric-path=Application%20Infrastructure%20Performance%7CRoot%7CIndividual%20Nodes%7CDESKTOP-2ONQ4R7%7CHardware%20Resources%7CMemory%7CFree%20%25&time-range-type=BEFORE_NOW&duration-in-mins=1440&output=json`,
        {
            auth:
            {
            username: appdUserName,
            password: appdPassword
            }
        }).then((result) =>{   
        var outerData=result.data;
        if(outerData.length==0)
        {
            step.context.sendActivity('No data found');
        }
        else
        {
             step.context.sendActivity(outerData[0].metricValues[0].sum);
        }
        });
        return await step.next();
      }
      else if(info=='Memory Used%')
      {
        
        await axios.get(`${appdLink}/controller/rest/applications/Server%20&%20Infrastructure%20Monitoring/metric-data?metric-path=Application%20Infrastructure%20Performance%7CRoot%7CIndividual%20Nodes%7CDESKTOP-2ONQ4R7%7CHardware%20Resources%7CMemory%7CUsed%20%25&time-range-type=BEFORE_NOW&duration-in-mins=1440&output=json`,
        {
            auth:
            {
            username: appdUserName,
            password: appdPassword
            }
        }).then((result) =>{   
        var outerData=result.data;
        if(outerData.length==0)
        {
            step.context.sendActivity('No data found');
        }
        else
        {
            step.context.sendActivity(outerData[0].metricValues[0].sum);
        }   
        });
        return await step.next();
      }
      else if(info=='Network Incoming Errors')
      {
        
        await axios.get(`${appdLink}/controller/rest/applications/Server%20&%20Infrastructure%20Monitoring/metric-data?metric-path=Application%20Infrastructure%20Performance%7CRoot%7CIndividual%20Nodes%7CDESKTOP-2ONQ4R7%7CHardware%20Resources%7CNetwork%7CIncoming%20Errors&time-range-type=BEFORE_NOW&duration-in-mins=1440&output=json`,
        {
            auth:
            {
            username: appdUserName,
            password: appdPassword
            }
        }).then((result) =>{   
        var outerData=result.data;
        if(outerData.length==0)
        {
            step.context.sendActivity('No data found');
        }
        else
        {
            step.context.sendActivity(outerData[0].metricValues[0].sum);
        }   
        });
        return await step.next();
      }
      else if(info=='Network Outgoing Errors')
      {
          
        await axios.get(`${appdLink}/controller/rest/applications/Server%20&%20Infrastructure%20Monitoring/metric-data?metric-path=Application%20Infrastructure%20Performance%7CRoot%7CIndividual%20Nodes%7CDESKTOP-2ONQ4R7%7CHardware%20Resources%7CNetwork%7COutgoing%20Errors&time-range-type=BEFORE_NOW&duration-in-mins=1440&output=json`,
        {
            auth:
            {
            username: appdUserName,
            password: appdPassword
            }
        }).then((result) =>{   
        var outerData=result.data;
        if(outerData.length==0)
        {
            step.context.sendActivity('No data found');
        }
        else
        {
            step.context.sendActivity(outerData[0].metricValues[0].sum);
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
          prompt: 'Any more Info about server?',
          choices: ChoiceFactory.toChoices(['yes', 'no'])
      });
  } 

  async finalStep(step)
  {
      if(step.result.value=='yes')
      {
         return await step.beginDialog('serverDialog');
      }
      else
      {   
          step.context.sendActivity('Bye');
          return await step.endDialog();
      }
  } 
   }

module.exports.ServerDialog = ServerDialog;
