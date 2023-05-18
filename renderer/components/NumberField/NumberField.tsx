import * as React from "react";

import styles from "./NumberField.module.scss";

import { NumberFieldProps } from "./NumberField.d";

const NumberField: React.FC<NumberFieldProps> = ({
  label = "",
  id = "",
  ...props
}) => {
  return (
    <div className="spectrum-Form-item">
      <label
        className="spectrum-FieldLabel spectrum-FieldLabel--sizeL spectrum-Form-itemLabel spectrum-FieldLabel--left"
        style={{ minWidth: "50px" }}
        htmlFor={id}
      >
        {label}
      </label>
      <div className="spectrum-Form-itemField">
        <div className="spectrum-Stepper">
          <div className="spectrum-Textfield spectrum-Stepper-textfield">
            <input
              type="number"
              className="spectrum-Textfield-input spectrum-Stepper-input"
              placeholder="Enter a number"
              //   min="-2"
              //   max=""
              // step={"0.01"}
              id={id}
              {...props}
            />
          </div>
          {/* <span className="spectrum-Stepper-buttons">
            <button className="spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-Stepper-stepUp">
              up
            </button>
            <button className="spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-Stepper-stepDown">
              down
            </button>
          </span> */}
        </div>
      </div>
    </div>
  );
};

export default NumberField;
