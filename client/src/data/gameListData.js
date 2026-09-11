/**
 * গেম-লিস্ট পেজের স্ট্যাটিক ডেটা (JILI স্লট — মূল সাইটের প্রথম পেজ)।
 *
 * server তৈরি হলে এটা `getGameListByGameFilter` এর জায়গা নেবে;
 * shape ইচ্ছে করেই API এর মতো রাখা হয়েছে।
 */

const GAME_ICON = "/assets/games/jili";

export const gameListPage = {
  vendor: { code: "AWCV2_JILI", name: "JILI" },
  category: { key: "slot", name: { bn: "স্লট", en: "Slot" } },
  pageInfo: { totalPage: 5, currentPage: 1, totalRecords: 161, perPageSize: 40 },
  records: [
    { gameId: 148573, gameCode: "JILI-SLOT-027", gameName: "Super Ace", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-027.png` },
    { gameId: 182427, gameCode: "JILI-SLOT-193", gameName: "Fortune Garuda 500", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-193.png` },
    { gameId: 153903, gameCode: "JILI-SLOT-138", gameName: "Fortune Gems 500", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-138.png` },
    { gameId: 190579, gameCode: "JILI-SLOT-225", gameName: "Fortune Garuda 1000", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-225.png` },
    { gameId: 148646, gameCode: "JILI-SLOT-107", gameName: "Money Coming Expand Bets", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-107.png` },
    { gameId: 148641, gameCode: "JILI-SLOT-102", gameName: "Super Ace Deluxe", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-102.png` },
    { gameId: 148577, gameCode: "JILI-SLOT-031", gameName: "Boxing King", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-031.png` },
    { gameId: 148575, gameCode: "JILI-SLOT-029", gameName: "Money Coming", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-029.png` },
    { gameId: 148635, gameCode: "JILI-SLOT-096", gameName: "Fortune Gems 3", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-096.png` },
    { gameId: 153198, gameCode: "JILI-SLOT-136", gameName: "Circus Joker 4096", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-136.png` },
    { gameId: 148658, gameCode: "JILI-SLOT-119", gameName: "bj FortuneGems", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-119.png` },
    { gameId: 151435, gameCode: "JILI-SLOT-129", gameName: "Fortune Coins", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-129.png` },
    { gameId: 151453, gameCode: "JILI-SLOT-130", gameName: "Super Ace II", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-130.png` },
    { gameId: 154911, gameCode: "JILI-SLOT-142", gameName: "Super Ace Speed", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-142.png` },
    { gameId: 148560, gameCode: "JILI-SLOT-014", gameName: "Crazy777", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-014.png` },
    { gameId: 148589, gameCode: "JILI-SLOT-043", gameName: "Fortune Gems", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-043.png` },
    { gameId: 148615, gameCode: "JILI-SLOT-076", gameName: "Fortune Gems 2", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-076.png` },
    { gameId: 148651, gameCode: "JILI-SLOT-112", gameName: "Money Pot", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-112.png` },
    { gameId: 154316, gameCode: "JILI-SLOT-148", gameName: "Clover Coins 4x4", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-148.png` },
    { gameId: 148588, gameCode: "JILI-SLOT-042", gameName: "Golden Empire", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-042.png` },
    { gameId: 148595, gameCode: "JILI-SLOT-049", gameName: "Alibaba", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-049.png` },
    { gameId: 148569, gameCode: "JILI-SLOT-023", gameName: "Golden Bank", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-023.png` },
    { gameId: 156688, gameCode: "JILI-SLOT-161", gameName: "Boxing King Title Match", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-161.png` },
    { gameId: 153199, gameCode: "JILI-SLOT-135", gameName: "Pirate Queen 2", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-135.png` },
    { gameId: 184254, gameCode: "JILI-SLOT-204", gameName: "Fortune Gems Legend", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-204.png` },
    { gameId: 148572, gameCode: "JILI-SLOT-026", gameName: "Charge Buffalo", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-026.png` },
    { gameId: 159729, gameCode: "JILI-SLOT-163", gameName: "Clover Coins 3x3", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-163.png` },
    { gameId: 148654, gameCode: "JILI-SLOT-115", gameName: "Lucky Jaguar", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-115.png` },
    { gameId: 148614, gameCode: "JILI-SLOT-075", gameName: "Wild Ace", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-075.png` },
    { gameId: 154492, gameCode: "JILI-SLOT-149", gameName: "Crazy777 2", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-149.png` },
    { gameId: 182154, gameCode: "JILI-SLOT-167", gameName: "Lucky Jaguar 2", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-167.png` },
    { gameId: 150094, gameCode: "JILI-SLOT-128", gameName: "Crystal 777 DELUXE", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-128.png` },
    { gameId: 153197, gameCode: "JILI-SLOT-137", gameName: "Joker Coins", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-137.png` },
    { gameId: 185339, gameCode: "JILI-SLOT-160", gameName: "Lucky Jaguar 500", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-160.png` },
    { gameId: 148561, gameCode: "JILI-SLOT-015", gameName: "Bubble Beauty", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-015.png` },
    { gameId: 158362, gameCode: "JILI-SLOT-162", gameName: "Money Pot Deluxe", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-162.png` },
    { gameId: 148597, gameCode: "JILI-SLOT-051", gameName: "Mega Ace", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-051.png` },
    { gameId: 148853, gameCode: "JILI-SLOT-120", gameName: "Super Ace Jeetbuzz", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-120.png` },
    { gameId: 148639, gameCode: "JILI-SLOT-100", gameName: "Jackpot Joker", vendorName: "JILI", icon: `${GAME_ICON}/JILI-SLOT-100.png` },
  ],
};

export default gameListPage;
