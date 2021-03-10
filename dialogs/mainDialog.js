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
    WaterfallDialog,
    ListStyle
} = require('botbuilder-dialogs');

const { BtDialog } =require('./Applications/btDialog')
const { ApplicationDialog }= require('./Applications/applicationDialog');
const { AlertRespondDialog }= require('./Alert&Respond/alertRespondDialog');
const { ReportsDialog }= require('./Reports/reportsDialog');
const { DatabaseDialog }= require('./Databases/databaseDialog');
const { ServerDialog }= require('./Servers/serverDialog');

var inputApp=null;

const SERVER_DIALOG='serverDialog';
const REPORTS_DIALOG='reportsDialog';
const ALERTRESPOND_DIALOG= 'alertRespondDialog';
const BT_DIALOG='btDialog'
const APPLICATION_DIALOG='applicationDialog';
const DATABASE_DIALOG ='databaseDialog';
const Main_Dialog='MainDialog';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const TEXT_PROMPT = 'textPrompt';
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class MainDialog extends ComponentDialog {
    constructor() {
        super( 'MainDialog');

        
       
        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new BtDialog(BT_DIALOG))
            .addDialog(new ApplicationDialog(APPLICATION_DIALOG))
            .addDialog(new AlertRespondDialog(ALERTRESPOND_DIALOG))
            .addDialog(new ReportsDialog(REPORTS_DIALOG))
            .addDialog(new DatabaseDialog(DATABASE_DIALOG))
            .addDialog(new ServerDialog(SERVER_DIALOG))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.introStep.bind(this),
                this.actStep.bind(this),
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

    /**
     * First step in the waterfall dialog. Prompts the user for a command.
     * Currently, this expects a booking request, like "book me a flight from Paris to Berlin on march 22"
     * Note that the sample LUIS model will only recognize Paris, Berlin, New York and London as airport cities.
     */
    async introStep(step) {
        
    
        
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Hi! How can I help u with?',
            choices: ChoiceFactory.toChoices(['Applications','DataBases','Servers','Reports','Alert&Respond']),
            style: ListStyle.heroCard
        });
    }

    /**
     * Second step in the waterfall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the bookingDialog child dialog to collect any remaining details.
     */
    async actStep(step) 
    {
        
        if(step.result.value=='Applications')
        {
            return await step.beginDialog(APPLICATION_DIALOG,{app:inputApp});
            
        }
     /*   else if(step.result.value=='User Experience')
        {
            step.context.sendActivity("Work in Progress");
            return await step.next();
        }*/
        else if(step.result.value=='DataBases')
        {
            return await step.beginDialog(DATABASE_DIALOG);
        }
        else if(step.result.value=='Servers')
        {
            return await step.beginDialog(SERVER_DIALOG);
        }
        else if(step.result.value=='Reports')
        {
            return await step.beginDialog(REPORTS_DIALOG);
        }
        else if(step.result.value=='Alert&Respond')
        {
            return await step.beginDialog(ALERTRESPOND_DIALOG);
        }
        else{}
        
    }

    async confirmStep(step)
    {
        if(step.result==0)
        {
            return await step.beginDialog('MainDialog');
        }
        else if(step.result==1)
        {
            return await step.beginDialog('MainDialog');
        }
        else
        {
            return await step.prompt(CHOICE_PROMPT, {
                 prompt: 'Any more Info about main menu?',
                choices: ChoiceFactory.toChoices(['yes', 'no'])
            });
        }    
    }   

    async finalStep(step)
    {
        if(step.result.value=='yes')
        {
           return await step.beginDialog(Main_Dialog);
        }
        else if(step.result.value=='no')
        {   
            step.context.sendActivity('Bye');
            return await step.endDialog();
        }
    } 
       
}

module.exports.MainDialog = MainDialog;