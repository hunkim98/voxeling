import { createContext, useState } from "react";

interface Props {
  children: React.ReactNode;
}

export interface ViewContextProps {
  cameraViewingFrom: {
    viewingFrom: "top" | "front" | "left" | "right" | "back" | "bottom";
    cameraRotateDegree: number;
  };
  setCameraViewingFrom: React.Dispatch<
    React.SetStateAction<{
      viewingFrom: "top" | "front" | "left" | "right" | "back" | "bottom";
      cameraRotateDegree: number;
    }>
  >;
}

const ViewContext = createContext<ViewContextProps>({} as ViewContextProps);

const ViewContextProvider = ({ children }: Props) => {
  const [cameraViewingFrom, setCameraViewingFrom] = useState<{
    viewingFrom: "top" | "front" | "left" | "right" | "back" | "bottom";
    cameraRotateDegree: number;
  }>({
    viewingFrom: "top",
    cameraRotateDegree: 0,
  });
  return (
    <ViewContext.Provider
      value={{
        cameraViewingFrom,
        setCameraViewingFrom,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
};

export { ViewContextProvider, ViewContext };
