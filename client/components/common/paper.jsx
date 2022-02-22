export const Paper = ({ className, children }) => {
  return <div className={`shadow-md flex flex-col p-4 ${className}`}>{children}</div>;
};
