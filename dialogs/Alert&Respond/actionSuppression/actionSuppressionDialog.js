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
//const { AppNameDialog }=require('./appNameDialog');
const { DateAndTimeASDialog }=require('./dateAndTimeASDialog');
var abc;

const dotenv = require('dotenv');
dotenv.config();

var appdLink=process.env.appdLink;
var appdUserName=process.env.appdUserName;
var appdPassword=process.env.appdPassword;
var accountId=process.env.accountId;

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
const APPNAME_DIALOG='appNameDialog';
const DATEANDTIMEAS_DIALOG='dateAndTimeASDialog';

var asName='Example';
var info, asId,inputApp='null', appId='',timeRangeFlag,asEndTime,asEndDate,asStartTime,asStartDate,asFinal;

class ActionSuppressionDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'actionSuppressionDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
          //  .addDialog(new AppNameDialog(APPNAME_DIALOG))
            .addDialog(new DateAndTimeASDialog(DATEANDTIMEAS_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                
                this.appNameStep.bind(this),
                this.appIdStep.bind(this),
                this.quesStep.bind(this),
                this.asNameStep.bind(this),
                this.startDateStep.bind(this),
                this.actionStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
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
    async quesStep(step)
    {   
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please choose the following actions',
            choices: ChoiceFactory.toChoices(['Add','Show All','Delete','Main Menu','BACK'])
        });
    }
    async asNameStep(step)
    {
        info=step.result.value;
        if(info=='Add')
        {
        return await step.prompt(TEXT_PROMPT,'Enter any Action Supression Name');
        }
        else if(info=='Delete')
        {
            await axios.get(`${appdLink}/controller/alerting/rest/v1/applications/${appId}/action-suppressions`,
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
                        step.context.sendActivity(result.data[i].name);
                    }     
                });
              return await step.prompt(TEXT_PROMPT,'Enter the Action Supression Name u want to delete from above list');
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
    async startDateStep(step)
      {
        asName=step.result;
        timeRangeFlag=-1;
        if(info=='Add')
        {
            timeRangeFlag=1;
        return await step.beginDialog(DATEANDTIMEAS_DIALOG, {range : asFinal});
        }
        else{
            return await step.next();
        }
      }
      
    async actionStep(step)
    {
     if(timeRangeFlag==1)
      {asStartDate=step.result.split(" ")[0];
        asStartTime=step.result.split(" ")[1];
        asEndDate=step.result.split(" ")[2];
        asEndTime=step.result.split(" ")[3];      
      }
        if(info=='Add')
        {
            
             await axios.post(`${appdLink}/controller/alerting/rest/v1/applications/${appId}/action-suppressions`,
             {
                 "name":asName,
                "disableAgentReporting":true,
                "startTime":asStartDate+'T'+asStartTime,
                "endTime":asEndDate+'T'+asEndTime,
                "affects":{
                     "affectedInfoType":"APPLICATION"
                 }
              },
                {
                    auth:
                    {
                        username: appdUserName,
                        password: appdPassword
                    }
               }).then((result) => 
                {
                    if(result.status==201)
                    {
                        step.context.sendActivity('Added succesfully');
                    }
                    else
                    {
                        step.context.sendActivity('Error');
                    }
                });


        }
        else if(info=='Show All')
        {
            await axios.get(`${appdLink}/controller/alerting/rest/v1/applications/${appId}/action-suppressions`,
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
                        step.context.sendActivity(result.data[i].name);
                    }     
                });
        }
        else if(info=='Delete')
        {
            var flag=-1;
            await axios.get(`${appdLink}/controller/alerting/rest/v1/applications/${appId}/action-suppressions`,
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
                   if(asName==result.data[i].name)       
                        {
                            flag=1;
                            asId=result.data[i].id; 
                            break;
                        }
                       
                }
                });

                if(flag==-1)
                    {    
                        step.context.sendActivity('There is no such Action Suppression');
                    }
               else
               {     
                    await axios.delete(`${appdLink}/controller/api/accounts/${accountId}/applications/${appId}/actionsuppressions/${asId}`,
                    {
                        auth:
                        {
                             username: appdUserName,
                            password: appdPassword
                        }
                     }).then((result) => 
                    {
                        if(result.status==204)
                        {
                            step.context.sendActivity('Deleted succesfully');
                        }
                        else
                        {
                            step.context.sendActivity('Error');
                        }
                    });
               }    

        }
        return await step.next();
    }
    async confirmStep(step)
  {
      abc=1;
      return await step.prompt(CHOICE_PROMPT, {
          prompt: 'Any more Info about Action Suppression?',
          choices: ChoiceFactory.toChoices(['yes', 'no'])
      });
  } 

  async finalStep(step)
  {
      if(step.result.value=='yes')
      {
         return await step.beginDialog('actionSuppressionDialog',{app:inputApp});
      }
      else
      {   
          step.context.sendActivity('Bye');
          return await step.endDialog();
      }
  } 
   }

module.exports.ActionSuppressionDialog = ActionSuppressionDialog;