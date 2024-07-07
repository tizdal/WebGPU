// self.onmessage = (event: MessageEvent) => {
//     const { startPos, bunnies } = event.data;
    
//     const closestIndex = findClosestHitBunny(startPos, bunnies);
    
//     self.postMessage(closestIndex);
//   };

  self.onmessage = (event) => {
    const { startPos, bunnies } = event.data;
    
    const closestIndex = findClosestHitBunny(startPos, bunnies);
    
    self.postMessage(closestIndex);
  };
  
  function findClosestHitBunny(startPos, bunnies) {
    let closestIndex = -1;
    let closestDistance = Number.MAX_VALUE;
  
    for (let i = 0; i < bunnies.length; i++) {
      const bunny = bunnies[i];
      const hit = hitTest(bunny.positionX, bunny.positionY, 25, 32, startPos.x, startPos.y);
  
      if (hit) {
        const distance = calculateDistance(bunny.positionX, bunny.positionY, startPos.x, startPos.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }
    }
  
    return closestIndex;
  }
  
  function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  
  function hitTest(
    x1,
    y1,
    width1,
    height1,
    x2,
    y2
  ) {
    return (
      x1 < x2 + 25 &&
      x1 + width1 > x2 &&
      y1 < y2 + 32 &&
      y1 + height1 > y2
    );
  }
  