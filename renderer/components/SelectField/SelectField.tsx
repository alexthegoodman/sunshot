import * as React from "react";

// import styles from "./SelectField.module.scss";
// import shared from "../../pages/shared.module.scss";

import { SelectFieldProps } from "./SelectField.d";
import { styled } from "styled-components";

export const Elipsis = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
`;

const SelectField: React.FC<SelectFieldProps> = ({
  id = "",
  label = "",
  items = null,
  selectedItem = null,
  onItemSelect = () => console.info("select item"),
}) => {
  const [open, setOpen] = React.useState(false);

  let buttonLabel = "Select an option";

  if (selectedItem) {
    const itemData = items.find((source) => source.id === selectedItem);
    buttonLabel = itemData.label;
  }

  const handleActionClick = () => {
    setOpen(!open);
  };

  const handleItemSelect = (itemId) => {
    onItemSelect(itemId);
    setOpen(false);
  };

  return (
    <>
      <div className="spectrum-Form-item">
        <label
          className="spectrum-FieldLabel spectrum-FieldLabel--sizeL spectrum-Form-itemLabel spectrum-FieldLabel--left"
          style={{ minWidth: "50px" }}
          htmlFor={id}
        >
          {label}
        </label>
        <div className="spectrum-Form-itemField">
          <button
            className={`spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet ${
              open ? "is-selected" : ""
            }`}
            onClick={handleActionClick}
          >
            <Elipsis className={`spectrum-ActionButton-label`}>
              {buttonLabel}
            </Elipsis>
          </button>

          <div
            className={`spectrum-Popover spectrum-Popover--bottom ${
              open ? "is-open" : ""
            }`}
          >
            <ul className="spectrum-Menu" role="menu">
              {items?.map((item) => (
                <li
                  key={item.id}
                  id={`video-${item.id}`}
                  onClick={() => handleItemSelect(item.id)}
                  className="spectrum-Menu-item"
                  role="menuitem"
                >
                  <Elipsis className={`spectrum-Menu-itemLabel`}>
                    {item.label}
                  </Elipsis>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectField;
