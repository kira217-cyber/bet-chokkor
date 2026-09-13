import { createContext, useContext } from "react";

/**
 * "গেম খেলা শীঘ্রই আসছে" মডাল খোলার হুক।
 *
 * কনটেক্সট আর হুক আলাদা ফাইলে — একই ফাইলে কম্পোনেন্ট আর হুক দুটোই
 * export করলে Vite এর fast refresh কাজ করে না।
 */
export const ComingSoonContext = createContext({ openComingSoon: () => {} });

export const useComingSoon = () => useContext(ComingSoonContext);
