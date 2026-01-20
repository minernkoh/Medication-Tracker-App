/**
 * NotFoundPage Component - Custom 404 page
 * Displays when user navigates to a non-existent route
 */

import { useNavigate } from "react-router-dom";
import { HouseIcon, ArrowLeftIcon } from "@phosphor-icons/react";
import { Button } from "../ui";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background-default w-full min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-6 bg-primary-light">
            <span className="font-poppins font-bold text-6xl text-primary">
              404
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-poppins font-bold text-3xl text-text-primary mb-3">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="font-poppins text-text-secondary mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2"
          >
            <HouseIcon size={20} weight="bold" />
            <span>Go to Dashboard</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon size={20} weight="bold" />
            <span>Go Back</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
