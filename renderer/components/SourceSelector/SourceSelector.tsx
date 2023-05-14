import * as React from "react";

import styles from "./SourceSelector.module.scss";

import { SourceSelectorProps } from "./SourceSelector.d";

const SourceSelector: React.FC<SourceSelectorProps> = ({
  sources = null,
  selectedSource = null,
  onSourceSelect = () => console.info("select source"),
}) => {
  const [open, setOpen] = React.useState(false);

  let label = "Select your video source";

  if (selectedSource) {
    const sourceData = sources.find((source) => source.id === selectedSource);
    label = sourceData.name;
  }

  const handleActionClick = () => {
    setOpen(!open);
  };

  const handleSourceSelect = (sourceId) => {
    onSourceSelect(sourceId);
    setOpen(false);
  };

  return (
    <>
      <button
        className={`spectrum-ActionButton spectrum-ActionButton--sizeM spectrum-ActionButton--quiet ${
          open ? "is-selected" : ""
        }`}
        onClick={handleActionClick}
      >
        <span className={`spectrum-ActionButton-label ${styles.elipsis}`}>
          {label}
        </span>
      </button>

      <div
        className={`spectrum-Popover spectrum-Popover--bottom ${
          open ? "is-open" : ""
        } ${styles.popover}`}
      >
        <ul className="spectrum-Menu" role="menu">
          {sources?.map((source) => (
            <li
              key={source.id}
              id={`video-${source.id}`}
              // className={source.id === selectedSource ? styles.selected : ""}
              onClick={() => handleSourceSelect(source.id)}
              className="spectrum-Menu-item"
              role="menuitem"
            >
              <span className={`spectrum-Menu-itemLabel ${styles.elipsis}`}>
                {source.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default SourceSelector;
