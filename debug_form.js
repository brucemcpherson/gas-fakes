import './main.js';
import { Syncit } from './src/support/syncit.js';

async function debug() {
  Syncit.fxInit();
  
  try {
    const resource = Forms.Form.create({
      info: {
        title: "Debug Form with Items"
      }
    });
    const formId = resource.formId;
    
    // Add a text item
    const updateRequest = {
      requests: [{
        createItem: {
          item: {
            title: "Question 1",
            questionItem: {
              question: {
                textQuestion: { paragraph: false }
              }
            }
          },
          location: { index: 0 }
        }
      }]
    };
    
    const updateResponse = Forms.Form.batchUpdate(updateRequest, formId);
    console.log("Update Response:", JSON.stringify(updateResponse, null, 2));
    
    const fullForm = Forms.Form.get(formId);
    console.log("Full Form Resource:", JSON.stringify(fullForm, null, 2));
    
  } catch (e) {
    console.error("Error:", e);
  }
}

debug();
