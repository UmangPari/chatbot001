// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { InputHints, MessageFactory } = require('botbuilder');
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

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

var startRange ='';
var endRange ='';
var finalRange='';
var rangeType='';

class TimeRangeDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'timeRangeDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
           //     this.rangeTypeStep.bind(this),
             //   this.startRangeStep.bind(this),
               // this.endRangeStep.bind(this),
                this.finalResultStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }
    async rangeTypeStep(step)
    {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'select Range Type',
            choices: ChoiceFactory.toChoices(['Before Now', 'Start and End time'])
        });    }
    async startRangeStep(step)
    {
        rangeType=step.result.value;
        if(step.result.value=='Before Now')
        {
            return await step.prompt(TEXT_PROMPT,'enter minutes');
        }
        else if(step.result.value=='Start and End time')
      {
          return await step.prompt(TEXT_PROMPT,'Enter start range in minutes');
      }
      else{}
}
    async endRangeStep(step)
    {   
        if(rangeType=='Before Now')
        {
            finalRange=step.result+ " "+"";
            return await step.endDialog(finalRange);      
        }
        else
        {
        startRange = step.result;
        return await step.prompt(TEXT_PROMPT,'Enter end range in minutes');
    }}
    async finalResultStep(step)
    {
      //  endRange = step.result;
        
        //finalRange= startRange+" "+endRange;

        finalRange='1440';
        return await step.endDialog(finalRange);
    }
}

module.exports.TimeRangeDialog = TimeRangeDialog;
