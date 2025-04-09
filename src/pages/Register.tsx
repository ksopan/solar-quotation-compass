
import React from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import RegisterContainer from "@/components/register/RegisterContainer";

const Register = () => {
  return (
    <MainLayout>
      <div className="flex justify-center items-center py-8">
        <RegisterContainer />
      </div>
    </MainLayout>
  );
};

export default Register;
