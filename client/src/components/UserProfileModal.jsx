import React from "react";
import { Modal, Button } from "flowbite-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";

const UserProfileModal = ({ show, onClose, user }) => {
  return (
    <Modal show={show} onClose={onClose} popup size={"md"}>
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <img
            src={user?.profilePicture}
            alt="Profile Picture"
            className="h-24 w-24 rounded-full mb-4 mx-auto"
          />
          <h3 className="mb-2 text-lg font-semibold text-gray-500 dark:text-gray-400">
            {user?.userName}
            {user?.userName !== "[Deleted]" ? `(${user?.fullName})` : ""}
          </h3>
          {/* <p className="mb-3 text-sm text-gray-400 dark:text-gray-300">
            Email: {user.email}
          </p> */}
          <div className="flex justify-center gap-4 mb-4">
            {user?.github && (
              <a
                href={`https://${user?.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <FaGithub />
              </a>
            )}
            {user?.linkedIn && (
              <a
                href={user?.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <FaLinkedin />
              </a>
            )}
          </div>
          {/* <div className="flex justify-center gap-4">
            <Button color={"gray"} onClick={onClose} className="ml-2">
              Close
            </Button>
          </div> */}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default UserProfileModal;
