import React from "react";
import Head from "next/head";
import electron from "electron";
import { styled } from "styled-components";
import { useForm } from "react-hook-form";

const ipcRenderer = electron.ipcRenderer;

const apiUrl =
  process.env.NODE_ENV === "production"
    ? "https://sunshot.app"
    : "http://localhost:3000";

const Main = styled.main`
  padding: 25px;
`;

const TextFieldWrapper = styled.div`
  margin-right: 10px;
`;

function License() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    // verify license via api
    const response = await fetch(apiUrl + "/licenses/" + formData.license, {
      method: "GET",
    });

    const data = await response.json();

    console.info("license data", data);

    if (response.ok && data.key === formData.license) {
      // save license
      ipcRenderer.sendSync("save-license-key", {
        licenseKey: formData.license,
      });

      // close this window
      ipcRenderer.sendSync("close-license-key-input");

      // open home
      ipcRenderer.sendSync("open-source-picker");
    } else {
      alert("Invalid license");
    }
  };

  return (
    <React.Fragment>
      <Head>
        <title>SunShot - Enter Your License</title>
      </Head>
      <Main className={`spectrum-Typography`}>
        <h1 className="spectrum-Heading spectrum-Heading--sizeL">
          Enter your license
        </h1>
        <p className="spectrum-Body spectrum-Body--sizeL">
          SunShot requires a license to use. Please enter your license below.
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextFieldWrapper className="spectrum-Textfield">
            <input
              type="text"
              className="spectrum-Textfield-input"
              placeholder="Enter your license"
              {...register("license", { required: true })}
            />
          </TextFieldWrapper>

          <button className="spectrum-Button spectrum-Button--fill spectrum-Button--accent spectrum-Button--sizeM">
            <span className="spectrum-Button-label">Submit</span>
          </button>
        </form>
      </Main>
    </React.Fragment>
  );
}

export default License;
