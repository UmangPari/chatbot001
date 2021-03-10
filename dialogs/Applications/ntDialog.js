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

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class NtDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'ntDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new AppNameDialog(APPNAME_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.appStep.bind(this),
                this.quesStep.bind(this),
                this.actionStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }
    async appStep(step)
    {
       inputApp=step.options;
       inputApp=inputApp.app;
       
              return await step.next();
    }
    async quesStep(step)
    {

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please choose the Report u want to know.',
            choices: ChoiceFactory.toChoices(['Tiers','Nodes','Main Menu','BACK'])
              });

    }
    
    async actionStep(step)
    {
        info= step.result.value;
            if(info=='Tiers')
        {

            await axios.get(`${appdLink}/controller/rest/applications/${inputApp}/tiers?output=json`,
            {
               auth:
                {
                    username: appdUserName,
                    password: appdPassword
                 }
            }).then((result) => 
                 {
                      step.context.sendActivity(result.data[0].name);
                });
                return await step.next();
        }
        else if(info=='Nodes')
        {

            await axios.get(`${appdLink}/controller/rest/applications/${inputApp}/nodes?output=json`,
            {
               auth:
                {
                    username: appdUserName,
                    password: appdPassword
                 }
            }).then((result) => 
                 {
                      step.context.sendActivity(result.data[0].name);
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
          prompt: 'Any more Info about Tiers and Nodes?',
          choices: ChoiceFactory.toChoices(['yes', 'no'])
      });
  } 

  async finalStep(step)
  {
      if(step.result.value=='yes')
      {
         return await step.beginDialog('ntDialog',{app:inputApp});
      }
      else
      {   
          step.context.sendActivity('Bye');
          return await step.endDialog();
      }
  }

   }

module.exports.NtDialog = NtDialog;