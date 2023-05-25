import * as React from "react";

import styles from "./SliderField.module.scss";

import { SliderFieldProps } from "./SliderField.d";
import { styled } from "styled-components";

const FormRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px;
`;

const SliderField: React.FC<SliderFieldProps> = ({
  label = "",
  id = "",
  ...props
}) => {
  return (
    <FormRow className="spectrum-Form-item">
      <div className="spectrum-Slider-labelContainer">
        <label
          className="spectrum-FieldLabel spectrum-FieldLabel--sizeL spectrum-Slider-label"
          id="spectrum-Slider-label-1"
          htmlFor={id}
          style={{ minWidth: "50px" }}
        >
          {label}
        </label>
      </div>
      <FormRow className="spectrum-Slider spectrum-Slider--sizeS">
        <div
          className="spectrum-Slider-value"
          role="textbox"
          aria-readonly="true"
          aria-labelledby={id}
          style={{ minWidth: "30px" }}
        >
          {props.value}
        </div>
        <div className="spectrum-Slider-controls">
          <div className="spectrum-Slider-track"></div>
          <div className="spectrum-Slider-handle">
            <input
              type="range"
              className="spectrum-Slider-input"
              step="0.1"
              min="1"
              max="5"
              id={id}
              {...props}
            />
          </div>
          <div className="spectrum-Slider-track"></div>
        </div>
      </FormRow>
    </FormRow>
  );
};

export default SliderField;
