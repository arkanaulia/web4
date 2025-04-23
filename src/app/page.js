import JackCard from "./components/JackCard";
import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      <div className="max-h-screen flex flex-col w-full align-middle items-center justify-items-center">
        <div className="w-full h-[40vh] bg-[url(/hero1.png)] bg-cover bg-center flex flex-row align-middle  items-center justify-center gap-8">
          <Image
            src="/logo.svg"
            alt="logo"
            width={2000}
            height={2000}
            className="w-max h-48"
          />
          <div className="size- inline-flex flex-col justify-start items-start">
            <div className="self-stretch mix-blend-difference justify-start text-orange-500 text-5xl font-normal font-sans">
              Everything.
            </div>
            <div className="w-[503px] justify-start text-white text-lg font-light font-sans">
              Unfortunately born to be jack of all trades—analyze, design, code,
              write, fix, plan—you name it. Not too flashy, just the one who
              gets it done when no one else can. Because in the end, everyone
              needs everything.{" "}
            </div>
          </div>
        </div>
        <div className="w-full flex flex-row h-[60vh] bg-[#151515] justify-between ">
          <div className="w-max">
            <Image
              src="/herologo.svg"
              alt="herologo"
              width={2000}
              height={1000}
              className="h-full w-full pl-5"
            />
          </div>
          <div className="w-[85%] p-6">
            <JackCard />
          </div>
        </div>
      </div>
    </div>
  );
}
