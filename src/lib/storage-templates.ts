export type Region = {
  id: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
};

export type StorageTemplate = {
  name: string;
  imageUrl: string;
  regions: Region[];
};

export const STORAGE_TEMPLATES: Record<string, StorageTemplate> = {
  "double-door-fridge": {
    name: "雙開門冰箱",
    imageUrl: "/images/storage/double-door-fridge.png",
    regions: [
      { id: "left-door", name: "冰箱左側門", bounds: { x: 0, y: 0, width: 50, height: 65 } },
      { id: "right-door", name: "冰箱右側冷藏", bounds: { x: 50, y: 0, width: 50, height: 65 } },
      { id: "bottom-freezer", name: "冷凍庫", bounds: { x: 0, y: 65, width: 100, height: 35 } }
    ]
  },
  "cabinet": {
    name: "櫥櫃",
    imageUrl: "/images/storage/cabinet.png",
    regions: [
      { id: "top-left", name: "左上玻璃櫃", bounds: { x: 0, y: 0, width: 50, height: 50 } },
      { id: "top-right", name: "右上玻璃櫃", bounds: { x: 50, y: 0, width: 50, height: 50 } },
      { id: "bottom-left", name: "左下抽屜", bounds: { x: 0, y: 50, width: 50, height: 50 } },
      { id: "bottom-right", name: "右下抽屜", bounds: { x: 50, y: 50, width: 50, height: 50 } }
    ]
  },
  "mobile-shelf": {
    name: "移動式層架",
    imageUrl: "/images/storage/mobile-shelf.png",
    regions: [
      { id: "tier-1", name: "第一層", bounds: { x: 0, y: 0, width: 100, height: 33 } },
      { id: "tier-2", name: "第二層", bounds: { x: 0, y: 33, width: 100, height: 33 } },
      { id: "tier-3", name: "第三層", bounds: { x: 0, y: 66, width: 100, height: 34 } }
    ]
  },
  "basket": {
    name: "移動式收納欄",
    imageUrl: "/images/storage/basket.png",
    regions: [
      { id: "basket-1", name: "第一層", bounds: { x: 0, y: 0, width: 100, height: 25 } },
      { id: "basket-2", name: "第二層", bounds: { x: 0, y: 25, width: 100, height: 25 } },
      { id: "basket-3", name: "第三層", bounds: { x: 0, y: 50, width: 100, height: 25 } },
      { id: "basket-4", name: "第四層", bounds: { x: 0, y: 75, width: 100, height: 25 } }
    ]
  },
  "office-cabinet": {
    name: "辦公櫃",
    imageUrl: "/images/storage/office-cabinet.png",
    regions: [
      { id: "drawer-1", name: "第一抽", bounds: { x: 0, y: 0, width: 100, height: 20 } },
      { id: "drawer-2", name: "第二抽", bounds: { x: 0, y: 20, width: 100, height: 20 } },
      { id: "drawer-3", name: "第三抽", bounds: { x: 0, y: 40, width: 100, height: 20 } },
      { id: "drawer-4", name: "第四抽", bounds: { x: 0, y: 60, width: 100, height: 20 } },
      { id: "drawer-5", name: "第五抽", bounds: { x: 0, y: 80, width: 100, height: 20 } }
    ]
  }
};
