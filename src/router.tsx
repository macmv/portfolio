import { useContext, useState } from "preact/hooks";
import { ComponentChildren, createContext } from "preact";

const PageContext = createContext<{
  currentPage: string;
  setCurrentPage: (path: string) => void;
}>({ currentPage: window.location.pathname, setCurrentPage: () => {} });

/**
 * Returns the current path.
 */
export const currentPage = (): string => {
  return useContext(PageContext).currentPage;
};

export const useSetCurrentPage = () => {
  const { setCurrentPage } = useContext(PageContext);

  return (path: string): void => {
    window.history.pushState({}, "", path);
    setCurrentPage(window.location.pathname);
  };
};

/**
 * Proves the `CurrentPage` context.
 */
export const Router = (props: { children: ComponentChildren }) => {
  const [currentPage, setCurrentPage] = useState(window.location.pathname);

  return (
    <PageContext.Provider value={{ currentPage, setCurrentPage }}>
      {props.children}
    </PageContext.Provider>
  );
};
