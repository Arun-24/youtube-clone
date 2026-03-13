// import React, { useState } from "react";
// import {
//   Home,
//   Compass,
//   PlaySquare,
//   Clock,
//   ThumbsUp,
//   History,
//   User,
// } from "lucide-react";
// import { Button } from "./ui/button";
// import Link from "next/link";
// import { useUser } from "@/lib/AuthContext";
// import Channeldialogue from "./channeldialogue";
// const Sidebar = () => {
//  const { user } = useUser();
//   const [isdialogeopen, setisdialogeopen] = useState(false)
//   return (
//     <aside className="w-64 min-h-screen p-2 border-r bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]">

//       <nav className="space-y-1">
//         <Link href="/">
//           <Button variant="ghost" className="w-full justify-start text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
//             <Home className="w-5 h-5 mr-3" />
//             Home
//           </Button>
//         </Link>
//         <Link href="/explore">
//           <Button variant="ghost" className="w-full justify-start text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
//             <Compass className="w-5 h-5 mr-3" />
//             Explore
//           </Button>
//         </Link>
//         <Link href="/subscriptions">
//           <Button variant="ghost" className="w-full justify-start text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
//             <PlaySquare className="w-5 h-5 mr-3" />
//             Subscriptions
//           </Button>
//         </Link>

//         {user && (
//           <>
//             <div className="border-t pt-2 mt-2">
//               <Link href="/history">
//                 <Button variant="ghost" className="w-full justify-start text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
//                   <History className="w-5 h-5 mr-3" />
//                   History
//                 </Button>
//               </Link>
//               <Link href="/liked">
//                 <Button variant="ghost" className="w-full justify-start text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
//                   <ThumbsUp className="w-5 h-5 mr-3" />
//                   Liked videos
//                 </Button>
//               </Link>
//               <Link href="/watch-later">
//                 <Button variant="ghost" className="w-full justify-start text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
//                   <Clock className="w-5 h-5 mr-3" />
//                   Watch later
//                 </Button>
//               </Link>
//               {user?.channelname ? (
//                 <Link href={`/channel/${user.id}`}>
//                   <Button variant="ghost" className="w-full justify-start text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
//                     <User className="w-5 h-5 mr-3" />
//                     Your channel
//                   </Button>
//                 </Link>
//               ) : (
//                 <div className="px-2 py-1.5">
//                   <Button
//                     variant="secondary"
//                     size="sm"
//                     className="w-full justify-start text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
//                     onClick={() => setisdialogeopen(true)}
//                   >
//                     Create Channel
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </nav>
//       <Channeldialogue
//         isopen={isdialogeopen}
//         onclose={() => setisdialogeopen(false)}
//         mode="create"
//       />
//     </aside>
//   );
// };

// export default Sidebar;
import React, { useState } from "react";
import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  User,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useUser } from "@/lib/AuthContext";
import Channeldialogue from "./channeldialogue";

const Sidebar = () => {
  const { user } = useUser();
  const [isdialogeopen, setisdialogeopen] = useState(false);

  const buttonClass =
    "w-full justify-start text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]";

  return (
    <aside className="w-64 min-h-screen p-2 border-r bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]">
      <nav className="space-y-1">
        <Link href="/">
          <Button variant="ghost" className={buttonClass}>
            <Home className="w-5 h-5 mr-3" />
            Home
          </Button>
        </Link>

        <Link href="/explore">
          <Button variant="ghost" className={buttonClass}>
            <Compass className="w-5 h-5 mr-3" />
            Explore
          </Button>
        </Link>

        <Link href="/subscriptions">
          <Button variant="ghost" className={buttonClass}>
            <PlaySquare className="w-5 h-5 mr-3" />
            Subscriptions
          </Button>
        </Link>

        {user && (
          <div className="border-t pt-2 mt-2">
            <Link href="/history">
              <Button variant="ghost" className={buttonClass}>
                <History className="w-5 h-5 mr-3" />
                History
              </Button>
            </Link>

            <Link href="/liked">
              <Button variant="ghost" className={buttonClass}>
                <ThumbsUp className="w-5 h-5 mr-3" />
                Liked videos
              </Button>
            </Link>

            <Link href="/watch-later">
              <Button variant="ghost" className={buttonClass}>
                <Clock className="w-5 h-5 mr-3" />
                Watch later
              </Button>
            </Link>

            {user?.channelname ? (
              <Link href={`/channel/${user.id}`}>
                <Button variant="ghost" className={buttonClass}>
                  <User className="w-5 h-5 mr-3" />
                  Your channel
                </Button>
              </Link>
            ) : (
              <div className="px-2 py-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setisdialogeopen(true)}
                >
                  Create Channel
                </Button>
              </div>
            )}
          </div>
        )}
      </nav>

      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
    </aside>
  );
};

export default Sidebar;
