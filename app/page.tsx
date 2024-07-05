import Link from "next/link";
import { SignIn } from "./components/sign-in";
import { SignOut } from "./components/sign-out";
import { auth } from "./auth";
import LandingPageContent from "./landing_page/landing";

export default async function Home() {
    const session = await auth();
    return (
        <>
            {!session ? (
                //TODO: Add your landing page here
                <div className="min-h-screen bg-[#5fc4e7] flex flex-col">
                    <LandingPageContent />
                </div>
            ) : (
                //TDOD: Add your home page here
                <div className="flex h-screen w-full bg-[#CCF3FF] flex-col items-center justify-between p-24">
                    <span>ExamCooker 2024</span>
                    <SignOut />
                    <Link
                        href={"/past_papers"}
                        className="bg-[#CCF3FF] text-white px-4 py-2 rounded-md shadow-md"
                    >
                        Append &apos;/past_papers&apos; to localhost link in the
                        searchbox, or click here.
                    </Link>
                    <Link
                        href={"/notes"}
                        className="bg-[#CCF3FF] text-white px-4 py-2 rounded-md shadow-md"
                    >
                        Append &apos;/notes&apos; to localhost link in the
                        searchbox, or click here.
                    </Link>
                </div>
            )}
        </>
    );
}
