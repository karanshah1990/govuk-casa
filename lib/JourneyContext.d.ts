import ValidationError = require("./validation/ValidationError");

export = JourneyContext;

declare class JourneyContext {
  constructor(data?: object, validation?: { [key: string]: JourneyContextPageValidation }, nav?: object);

  toObject(): JourneyContextObject;

  static fromObject(obj: JourneyContextObject): JourneyContext;

  public data: object;

  public validation: object;

  getData(): object;

  getDataForPage(pageId: string | PageMeta): object;

  setData(data: object): JourneyContext;

  setDataForPage(page: string | PageMeta, data: object): JourneyContext;

  getValidationErrors(): { [key: string]: JourneyContextPageValidation };

  removeValidationStateForPage(pageId: string): JourneyContext;

  clearValidationErrorsForPage(pageId: string): JourneyContext;

  setValidationErrorsForPage(pageId: string, errors: JourneyContextPageValidation): JourneyContext;

  getValidationErrorsForPage(pageId: string): JourneyContextPageValidation;

  hasValidationErrorsForPage(pageId: string): boolean;

  isPageValid(pageId: string): boolean;
}

interface JourneyContextObject {
  data: object;
  validation: JourneyContextValidation;
  nav: object;
}

interface JourneyContextPageValidation {
  [key: string]: Array<ValidationError>
}
