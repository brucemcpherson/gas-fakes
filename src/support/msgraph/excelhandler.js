import { MsExcel } from './msexcel.js';

export class ExcelHandler {
  constructor(Auth) {
    this.Auth = Auth;
    this.msExcel = null;
  }

  async init() {
    const token = await this.Auth.getAccessToken();
    this.msExcel = new MsExcel(token);
  }

  async closeSession(workbookId) {
    if (!this.msExcel) await this.init();
    await this.msExcel.closeSession(workbookId);
  }

  async handle({ subProp, prop, method, params, options }) {
    if (!this.msExcel) await this.init();

    // Map of handlers to avoid if/else mess
    const handlers = {
      spreadsheets: {
        __root: {
          get: (p) => this.msExcel.getWorkbook(p.spreadsheetId),
          create: async (p) => {
            return await this.msExcel.createWorkbook(p.requestBody.properties.title);
          },
          batchUpdate: async (p) => {
            const replies = [];
            for (const request of (p.requestBody?.requests || [])) {
              if (request.addSheet) {
                const result = await this.msExcel.addWorksheet(p.spreadsheetId, request.addSheet.properties.title);
                replies.push({ addSheet: result });
              } else {
                // Dummy response for formatting/etc
                replies.push({});
              }
            }
            return {
              spreadsheetId: p.spreadsheetId,
              replies: replies
            };
          }
        },
        values: {
          get: (p) => this.msExcel.getValues(p.spreadsheetId, p.range),
          update: (p) => this.msExcel.updateValues(p.spreadsheetId, p.range, p.requestBody.values),
          batchUpdate: (p) => this.msExcel.batchUpdateValues(p.spreadsheetId, p.requestBody.data),
        }
      }
    };

    const propHandler = handlers[prop];
    if (!propHandler) {
      throw new Error(`MS Excel Graph API property ${prop} not implemented`);
    }

    const target = subProp ? propHandler[subProp] : propHandler.__root;
    if (!target || !target[method]) {
      throw new Error(`MS Excel Graph API ${prop}.${subProp ? subProp + '.' : ''}${method} not implemented`);
    }

    const data = await target[method](params);
    return { data, response: { status: 200 } };
  }
}