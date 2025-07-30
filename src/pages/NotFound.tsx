import { ErrorPage } from "@/components/ui/error-page";

const NotFound = () => {
  return (
    <ErrorPage 
      type="404"
      showBackButton={true}
      showHomeButton={true}
    />
  );
};

export default NotFound;
