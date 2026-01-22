import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserIcon, ArrowLeftIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { PageHeader, GradientBackground, Button, FormField } from "../ui";
import { useError } from "../../contexts/ErrorContext";
import { api } from "../../api";

const AccountDetailsPage = ({ user, onUserUpdate }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: user?.name || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setIsLoading(true);
    try {
      const updatedUser = await api.users.update(user.id || user._id, {
        name: formData.name,
      });
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      setSuccessMessage("Profile updated successfully");
    } catch (error) {
      showError(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-default w-full relative min-h-screen">
      <GradientBackground />

      <div className="relative flex flex-col gap-6 items-start pt-10 px-4 md:px-8 w-full z-10 pb-10">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-2 font-poppins font-medium text-text-secondary hover:text-text-primary transition-colors w-fit"
          >
            <ArrowLeftIcon size={20} weight="bold" />
            Back to Settings
          </button>

          <PageHeader
            title="Account Details"
            description="Update your display name"
          />

          {successMessage && (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl font-poppins text-sm font-medium border border-green-100 animate-fade-in">
              {successMessage}
            </div>
          )}

          {/* Profile Section */}
          <div className="bg-background-default border border-border-default rounded-2xl p-6">
            <h2 className="font-poppins font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              <UserIcon size={24} className="text-primary" weight="fill" />
              Profile Information
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <FormField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                icon={<UserIcon size={18} className="text-icon-secondary" />}
                required
              />

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  icon={<FloppyDiskIcon size={18} weight="bold" />}
                >
                  Update Name
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsPage;
