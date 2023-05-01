import * as React from "react";

import styles from "./Modal.module.scss";

import { ModalProps } from "./Modal.d";

const Modal: React.FC<ModalProps> = ({ children = null }) => {
  return (
    <section>
      <div>{children}</div>
    </section>
  );
};

export default Modal;
