import { LogoComponent } from "@/components/asset/logo";
import { ArrowRight, Instagram, Mail, Phone } from "lucide-react";
import Image from "next/image";

export const HomeView = () => {
  return (
    <div className="flex flex-col w-full gap-[37px]">
      {/*  hero section */}
      <div className="bg-brand-500 py-[40px]">
        <div className="font-serif flex-col justify-center items-center mx-auto w-[300px] text-center text-gray-50  ">
          <p className="font-extrabold text-[32px]  leading-[110%]">One Song Yoga Teacher Training </p>
          <p className="font-normal text-xl mt-4">One Song Yoga Teacher Training </p>
          <div className="flex items-center w-full justify-center mt-4 gap-2.5">
            <LogoComponent className="w-[99px] h-[32px]" src="sehela-light.png" />
            <div>
              <Image src={"/assets/one-song.png"} alt="one-song" width={48} height={48} />
            </div>
          </div>
        </div>
      </div>
      {/* motot */}
      <div className="mx-auto flex flex-col items-center justify-center max-w-[80%] w-full">
        <p className="font-serif italic leading-[130%] text-center text-brand-500">
          Our approach is altruistic by nature and we are dedicated to the development of the participant and their future endeavors. OSY sees yoga in
          a healing light that has many forms, and each member of our team is committed to being in service to our students.
        </p>
        <p className="font-serif italic leading-[130%] text-center text-brand-500 ">This is true for all of our courses.</p>
        <p className="font-serif italic leading-[130%] text-center text-brand-500 mt-4">– Denise Payne, founder, One Song Yoga</p>
      </div>
      {/* home-pict */}
      <div className="flex flex-col mx-auto gap-2">
        <div className="flex flex-row items-center gap-2">
          <div className="relative flex rounded-xl h-full">
            <Image src="/assets/home-page/asset-2.png" alt="asset-2" width={220} height={154} />
          </div>
          <div className="relative flex rounded-xl h-full">
            <Image src="/assets/home-page/asset-1.png" alt="asset-1" width={132} height={154} />
          </div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="relative flex rounded-xl h-[167px]">
            <Image src="/assets/home-page/asset-4.png" alt="asset-4" width={132} height={167} objectFit="fill" />
          </div>
          <div className="relative flex rounded-xl h-[167px]">
            <Image src="/assets/home-page/asset-3.png" alt="asset-3" width={220} height={167} />
          </div>
        </div>
      </div>
      {/* profile */}
      <div className="flex flex-col gap-8 text-brand-500 font-serif w-full mx-auto px-4">
        <p className="text-xl font-extrabold">Our Profile</p>
        <div className="flex flex-col gap-4">
          <p className="text-xl font-medium">Sehela Space</p>
          <p className="font-medium">
            Sehela Space is a tranquil yoga studio situated in South Jakarta. Yoga is deeply intertwined with breathing, serving as its fundamental
            aspect. The name “Sehela” aptly reflects this connection, as yoga and breathing begin with a breath. Our regular class varies from yoga,
            meditation, sound healing, reiki, and access bar.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-xl font-medium">Denise Payne</p>
          <p className="font-medium">
            Denise Payne is a renowned yoga instructor, training facilitator, founder, and published author with over four decades of committed
            practice. At 61 years old, she exemplifies the enduring benefits of yoga, demonstrating that a lifelong dedication to the practice can
            promote vitality and flexibility.
          </p>
        </div>
      </div>
      {/* our clasess */}
      <div className="flex flex-col gap-2.5 text-brand-500 font-serif w-full mx-auto max-w px-4">
        <p className="text-xl font-extrabold">Our Clasess</p>
        <div className="flex items-center gap-4 mt-2.5">
          <div className="relative flex rounded-xl h-full">
            <Image src="/assets/home-page/yoga.png" alt="yoga class" width={138} height={97} />
          </div>
          <div className="">
            <p className="font-bold">Yoga Class</p>
            <p className="font-medium text-sm">Stretch, strengthen, and relax your mind and body.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex rounded-xl h-full">
            <Image src="/assets/home-page/ballet.png" alt="ballet class" width={138} height={97} />
          </div>
          <div className="">
            <p className="font-bold">Ballet Class</p>
            <p className="font-medium text-sm">Learn graceful moves with strength and precision.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex rounded-xl h-full">
            <Image src="/assets/home-page/pilates.png" alt="pilates class" width={138} height={97} />
          </div>
          <div className="">
            <p className="font-bold">Pilates Class</p>
            <p className="font-medium text-sm">Improve posture, core strength, and balance.</p>
          </div>
        </div>
      </div>

      {/* badge */}
      <div className="flex flex-col mx-auto">
        <div className="relative ">
          <Image src="/assets/home-page/certification.png" alt="certification" width={355} height={50} objectFit="contain" />
        </div>
      </div>

      {/* location */}
      <div className="flex flex-col gap-5 text-brand-500 font-serif w-full mx-auto px-4">
        <p className="text-xl font-extrabold">Location</p>
        <div className="flex flex-col gap-2">
          <p className="leading-[140%] font-normal">Sehela Space Yoga Studio</p>
          <a href="https://maps.app.goo.gl/7xg1z5HUfNguvLfz8" target="_blank" className="flex items-center text-center font-semibold">
            View on map{" "}
            <span>
              <ArrowRight size={18} strokeWidth={1.5} />
            </span>
          </a>
        </div>
        <div className="relative w-full flex min-h-[444px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.681291702096!2d106.78959747499107!3d-6.3055381936836845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69efdaf22abb4f%3A0x12a619abf4efc3e4!2sSehela%20Space%20Yoga%20Studio!5e0!3m2!1sen!2sid!4v1756450454795!5m2!1sen!2sid"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="flex w-full"
          ></iframe>
        </div>
      </div>
      {/* Footer */}
      <div className="bg-brand-500 flex w-full text-gray-50 font-serif">
        <div className="px-4 py-10.5 flex flex-col gap-9.5 w-full">
          <div className="flex flex-col gap-6">
            <p className="text-xl font-bold">Contacts</p>
            <div className="flex flex-col gap-4 font-normal">
              <p className="flex items-center gap-2.5 text-sm">
                <Phone />
                +628111469688
              </p>
              <p className="flex items-center gap-2.5 text-sm">
                <Mail />
                sehelaspace@gmail.com
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-xl font-bold">Socials</p>
            <div className="flex flex-col gap-4 font-normal">
              <p className="flex items-center gap-2.5 text-sm">
                <Instagram />
                @sehelaspace
              </p>
              <p className="flex items-center gap-2.5 text-sm">
                <Instagram />
                @denisepayneyoga
              </p>
            </div>
          </div>
          <div className="flex  justify-center items-center mx-auto">
            <div className="flex items-center w-full justify-center mt-4 gap-2.5">
              <LogoComponent className="w-[99px] h-[32px]" src="sehela-light.png" />
              <div>
                <Image src={"/assets/one-song.png"} alt="one-song" width={48} height={48} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
