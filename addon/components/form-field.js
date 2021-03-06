import Ember from 'ember';
import layout from '../templates/components/form-field';

import { humanize } from '../utils/strings';

const {
  assert,
  computed,
  computed: { notEmpty, reads },
  get,
  getWithDefault,
  guidFor,
  isPresent,
  mixin,
  observer,
  set,
  Component
} = Ember;

const FormFieldComponent = Component.extend({
  layout,

  concatenatedProperties: [
    'inputClasses',
    'labelClasses',
    'hintClasses',
    'errorClasses'
  ],

  control: 'one-way-input',

  init() {
    this._super(...arguments);

    this.propertyNameDidChange();
  },

  didReceiveAttrs() {
    this._super(...arguments);

    assert(`{{form-field}} requires an object property to be passed in`,
           get(this, 'object') != null);

    assert(`{{form-field}} requires the propertyName property to be set`,
           typeof get(this, 'propertyName') === 'string');
  },

  propertyNameDidChange: observer('propertyName', function() {
    let propertyName = get(this, 'propertyName');

    mixin(this, {
      rawValue: reads(`object.${propertyName}`),
      errors: reads(`object.errors.${propertyName}`),
      hasErrors: notEmpty(`object.errors.${propertyName}`)
    });
  }),

  update(object, propertyName, value) {
    set(object, propertyName, value);
  },

  labelText: computed('propertyName', 'label', function() {
    return get(this, 'label') || humanize(get(this, 'propertyName'));
  }),

  fieldId: computed('object', 'form', 'propertyName', function() {
    let baseId = get(this, 'form') || get(this, 'elementId');
    return `${baseId}_${get(this, 'propertyName')}`;
  }),

  fieldName: computed('object', 'object.modelName', 'propertyName', function() {
    return `${this._nameForObject()}[${get(this, 'propertyName')}]`;
  }),

  describedByValue: computed('hint', 'errors.[]', 'fieldId', function() {
    let ids = [];
    let hint = get(this, 'hint');
    let errors = get(this, 'errors');
    let fieldId = get(this, 'fieldId');

    if (isPresent(hint)) {
      ids.push(`${fieldId}_hint`);
    }

    if (isPresent(errors)) {
      errors.forEach((_, index) => {
        ids.push(`${fieldId}_error-${index}`);
      });
    }

    return ids.join(' ');
  }),

  _nameForObject() {
    return get(this, 'object.modelName') ||
           get(this, 'object.constructor.modelName') ||
           guidFor(get(this, 'object'));
  },

  value: computed('rawValue', function() {
    let serializeValue = getWithDefault(this, 'serializeValue', (value) => value);
    return serializeValue(get(this, 'rawValue'));
  }),

  actions: {
    processUpdate(object, propertyName, value) {
      let rawValue = get(this, 'rawValue');
      let deserializeValue = getWithDefault(this, 'deserializeValue', (value) => value);
      get(this, 'update')(object, propertyName, deserializeValue(value, rawValue));
    }
  }
});

FormFieldComponent.reopenClass({
  positionalParams: ['propertyName']
});

export default FormFieldComponent;
