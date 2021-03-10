// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.


const { MessageFactory, InputHints } = require('botbuilder');
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
const { BtDialog } =require('./btDialog')
const{ AppNameDialog }=require('./appNameDialog');

const { NtDialog } = require('./ntDialog');
const {SepDialog } = require('./sepDialog');

const MAIN_DIALOG='mainDialog';
const BT_DIALOG='btDialog';
const APPNAME_DIALOG='appNameDialog'
const NT_DIALOG = 'ntDialog';
const SEP_DIALOG = 'sepDialog'

var inputApp;
var info;
var flag=-1;

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const TEXT_PROMPT = 'textPrompt';
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class ApplicationDialog extends ComponentDialog {
    constructor() {
        super( 'applicationDialog');

        
       
        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new BtDialog(BT_DIALOG))
            .addDialog(new SepDialog(SEP_DIALOG))
            .addDialog(new NtDialog(NT_DIALOG))
            .addDialog(new AppNameDialog(APPNAME_DIALOG))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.appStep.bind(this),
                this.appActionStep.bind(this),
                this.appActionChoiceStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
                ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

   
    async appStep(step)
    {
        if (step.options.app==null)
       {
           flag=1;
          return await step.beginDialog(APPNAME_DIALOG);
       }
       else
       {
           inputApp=step.options.app;
           return await step.next();
       }
       
    }
    async appActionStep(step)
    { 
        if(flag==1)
        {
          inputApp=step.result;
          flag=-1;
        }  
       
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Hi! How can I help u with?',
            choices: ChoiceFactory.toChoices(['Business-transactions','Service Endpoints','Tiers & Nodes','Main Menu','BACK'])
        });
    }
    async appActionChoiceStep(step)
    {
        info=step.result.value;
        if(info=='Business-transactions'){
            
            return await step.beginDialog(BT_DIALOG,{app:inputApp});
        }
        else if(info=='Service Endpoints'){
            
            return await step.beginDialog(SEP_DIALOG,{app:inputApp});
        }
        else if(info=='Tiers & Nodes'){
            
            return await step.beginDialog(NT_DIALOG,{app:inputApp});
        }
     /*   else if(info=='(Servers)'){
            
            step.context.sendActivity("Work in Progress");
            return await step.endDialog();
        }
        else if(info=='(Containers)'){
            
            step.context.sendActivity("Work in Progress");
            return await step.endDialog();
        }
        else if(info=='(Database Calls)'){
            
            step.context.sendActivity("Work in Progress");
            return await step.endDialog();
        }
        else if(info=='(Remote Services)'){
            
            step.context.sendActivity("Work in Progress");
            return await step.endDialog();
        }*/
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
        if(step.result==1)
        {
                 return await step.beginDialog('applicationDialog',{app:inputApp});
            
        }
        else if(step.result==0)
        {
            return await step.endDialog(0);
        }
        else
        {
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Any more Info about application?',
                choices: ChoiceFactory.toChoices(['yes', 'no'])
            });
        }    
    } 
 
    async finalStep(step)
    {
        if(step.result==0)
      {
          return await step.endDialog(0);
      }
      else if(step.result==1)
      {
          return await step.endDialog(0);
      }
       else if(step.result.value=='yes')
        {
           
           return await step.beginDialog('applicationDialog',{app:inputApp});
        }
        else
        {   
            return await step.endDialog();
        }
    } 
}

module.exports.ApplicationDialog = ApplicationDialog;
