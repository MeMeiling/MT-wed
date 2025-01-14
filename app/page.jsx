import Button from "../components/Button";

export default function Landing() {
  return (
    <div
      className="h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/bg1.jpg')" }} // ใช้ bg1.jpg เป็นพื้นหลัง
    >
      <div className="flex flex-col justify-start pt-[5%] xl:pt-[4%] px-4">
        <h1 className="text-6xl md:text-7xl font-bold text-maincolor mb-4 text-center drop-shadow-lg">
          Meiling & Tul
        </h1>
        <h3 className="text-3xl md:text-4xl font-medium text-[#ACB593] mb-4 md:mb-10 text-center drop-shadow-lg">
          - Wedding Wishes Garden -
        </h3>
        <div className="flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-4 justify-center items-center">
          <Button
            variant="main" // ใช้ปุ่มแบบ main
            href="/guestbook"
            className=""
          >
            Join the Event !!
          </Button>
          <Button
            variant="sub" // ใช้ปุ่มแบบ secondary
            href="/garden"
            className=""
          >
            Visit the Garden
          </Button>
        </div>
      </div>
    </div>
  );
}
