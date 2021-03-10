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

const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

var asFinal,asStartDate,asStartTime,asEndDate,asEndTime;

class DateAndTimeASDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'dataAndTimeASDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.startDateStep.bind(this),
                this.startTimeStep.bind(this),
                this.endDateStep.bind(this),
                this.endTimeStep.bind(this),
                this.dataTimeCheckStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    
    async startDateStep(step)
      {
          
        return await step.prompt(TEXT_PROMPT,'enter start date in yyyy-mm-dd format');
      }
      async startTimeStep(step)
      {
          asStartDate=step.result;
          return await step.prompt(TEXT_PROMPT,"enter start time in hh:mm:ss");
      } 
      async endDateStep(step)
      {
        asStartTime=step.result;
        return await step.prompt(TEXT_PROMPT,"enter end date in yyyy-mm-dd format");
      }
      async endTimeStep(step)
      {
          asEndDate=step.result;
          return await step.prompt(TEXT_PROMPT,"enter end time in hh:mm:ss");
      } 
      async dataTimeCheckStep(step)
      {
          asEndTime=step.result;
          if(asStartDate[4]!='-'||asStartDate[7]!='-'||asStartTime[2]!=':'||asStartTime[5]!=':'
          ||asEndDate[4]!='-'||asEndDate[7]!='-'||asEndTime[2]!=':'||asEndTime[5]!=':')
          {
              step.context.sendActivity('Please write Date and time in right format');
            return await step.beginDialog('dateAndTimeASDialog');
          }
             else
          {
              asFinal=asStartDate+' '+asStartTime+' '+asEndDate+' '+asEndTime;
              return await step.endDialog(asFinal);
          }
      }
      
   }

module.exports.DateAndTimeASDialog = DateAndTimeASDialog;
