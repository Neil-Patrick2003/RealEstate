import { ChevronDown } from "lucide-react";
import { useState } from "react";
import {motion} from 'framer-motion';

export default function DesktopMenu({menu}) {
    
    const [ isHover, setIsHover] = useState(false);


    const toggleHoverMenu = () => {
        setIsHover(!isHover);
    }

    // animation variants
    const subMenuAnimate = {
        enter: {
            opacity: 1,
            rotateX: 0,
            transition: {
                duration: 0.3 
            },
            display: "block"

        },
        exit: {
            opacity: 0,
            rotateX: -15,
            transition: {
                duration: 0.3,
            },
            display: "none",
        }
    }

    // checking if the menu has submenu
    const hasSubMenu = menu.subMenu?.length > 0;
    return (
        <motion.li className="group/link" onHoverStart={toggleHoverMenu} onHoverEnd={toggleHoverMenu}>
            <span className="flex-center text-white gap-1 cursor-pointer px-3 py-1 rounded-xl hover:bg-white/10 duration-200">
                {menu.name}
                {hasSubMenu && (
                    <ChevronDown className="mt-[0.6px] group-hover/link:rotate-180 duration-200" />
                )}
            </span>
            {hasSubMenu && (
                <motion.div className="sub-menu"
                    initial="exit"
                    animate={ isHover? "enter" : "exit" }
                    variants={subMenuAnimate}
                >
                    <div className={`grid gap-7 ${
                        menu.gridCols === 3 ? 'grid-cols-3' : menu.gridCols === 2 ?'grid-cols-2' : 'grid-cols-1'
                    }`}>
                        { menu?.subMenu?.map((subMenu, i) => (
                            <div key={i} className="relative cursor-pointer">
                                <div className="flex-center gap-x-4 group/menubox">
                                    <div className="bg-green-100 w-fit p-2 rounded-md group-hover/menubox:bg-green-400 group-hover/menubox:text-white duration-300">
                                        {subMenu?.icon && <subMenu.icon/>}
                                    </div>
                                    <div>
                                        <h6 className="fonst-semibold">{subMenu?.name}</h6>
                                        <p className="text-sm">{subMenu.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
            
        </motion.li>
    );
}