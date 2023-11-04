type Dictionary = { [key: string]: any };

export const findToUpdate = (current: Dictionary[], incoming: Dictionary[]): Dictionary[] => {
  return incoming.filter((incomingItem: Dictionary) => {
    const currentItem = current.find((curr: Dictionary) => curr.id === incomingItem.id);
    if (!currentItem) return false;

    return Object.keys(incomingItem).some((key: string) => {
      if (typeof incomingItem[key] === 'object' && incomingItem[key] !== null) {
        // Recursive deep comparison for nested objects
        return JSON.stringify(currentItem[key]) !== JSON.stringify(incomingItem[key]);
      }
      return currentItem[key] !== incomingItem[key];
    });
  });
};

export const findToDelete = (current: any[], incoming: any[]) => {
  return current.filter(curr => !incoming.some(item => item.id === curr.id));
};

export const findToCreate = (current: any[], incoming: any[]) => {
  return incoming.filter(item => !current.some(curr => curr.id === item.id));
};