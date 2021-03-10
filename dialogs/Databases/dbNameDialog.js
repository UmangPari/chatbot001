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

var totalDB='';
var inputDB='';

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class DbNameDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'dbNameDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.appStep.bind(this),
                this.appCheckStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async appStep(step) {
            
        await axios.get(`${appdLink}/controller/rest/databases/servers?output=json`,
        {
          auth:
          {
            username: appdUserName,
            password: appdPassword
          }
        }).then((result) =>{   
         totalDB=result.data;
        });  
        
        for(var i=0;i<totalDB.length;i++)
        {
          step.context.sendActivity(totalDB[i].name);
        }
           return await step.prompt(TEXT_PROMPT,'hello! Please enter the Database name from above list');
    }

    async appCheckStep(step)
    {
        var flag=-1;
        inputDB=step.result;
        for(var i=0;i<totalDB.length;i++)
        {
          if(totalDB[i].name=inputDB)
          {
            flag=1;
            break;
          }
        } 
        if(flag==-1)
        {
          step.context.sendActivity('Sorry! You entered wrong name');
          return await step.beginDialog('dbNameDialog');
        }
        else{
            return await step.endDialog(inputDB);
        }

    }
   }

module.exports.DbNameDialog = DbNameDialog;
