const createLogger = require('../../lib/Logger');
const Validation = require('../../lib/Validation.js');
const { executeHook } = require('./utils.js');

module.exports = (pageMeta = {}) => (req, res, next) => {
  const logger = createLogger('page.validate');
  logger.setSessionId(req.session.id);
  const pageId = pageMeta.id;

  /**
   * Run validation process.
   *
   * @return {Promise} Promise
   */
  function runValidation() {
    let result;
    if (pageMeta && pageMeta.fieldValidators) {
      logger.trace('Run validation for %s', pageId);
      result = Validation.processor(
        pageMeta.fieldValidators,
        req.journeyData.getDataForPage(pageId), {
          reduceErrors: true,
        },
      );
    } else {
      result = Promise.resolve();
    }
    return result;
  }

  // Promise
  return executeHook(logger, req, res, pageMeta, 'prevalidate')
    .then(runValidation)
    .then(() => (executeHook(logger, req, res, pageMeta, 'postvalidate')))
    .then(() => {
      // Validation has passed, so clear any validation errors currently stored
      // against the page
      req.journeyData.clearValidationErrorsForPage(pageId);
      req.session.journeyValidationErrors = req.journeyData.getValidationErrors();

      // The next middleware handler is responsible for moving the user onto the
      // correct next waypoint.
      next();
    })
    .catch((errors) => {
      // If it's a real error (i.e. thrown by interpreter rather than application)
      // we want to capture that earlier. Otherwise, treat as a validation error
      if (errors instanceof Error) {
        logger.trace('Passing through system error on waypoint %s: %s', pageId, errors.message);
        next(errors);
        return;
      }

      // Store validation results so they can be used during future traversals
      logger.trace('Storing validation errors on waypoint %s', pageId);
      req.journeyData.setValidationErrorsForPage(pageId, errors);
      req.session.journeyValidationErrors = req.journeyData.getValidationErrors();

      next();
    });
}