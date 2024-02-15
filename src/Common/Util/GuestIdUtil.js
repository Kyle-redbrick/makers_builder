import uuidv4 from "uuid/v4";

const generateGuestId = () => {
  const uuid = uuidv4();
  const guestId = "guest_" + uuid.substring(0, 6);
  return guestId;
};

export const getGuestId = () => {
  let guestId = localStorage.getItem("GUESTID");
  if (!guestId) {
    guestId = generateGuestId();
    localStorage.setItem("GUESTID", guestId);
  }
  return guestId;
};
