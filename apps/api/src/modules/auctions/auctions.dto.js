export const getStatus = (a, now = new Date()) =>
  now < a.startsAt ? "UPCOMING" : now < a.endsAt ? "LIVE" : "ENDED";

const prices = (a) => ({
  startingPrice: a.startingPrice,
  bidStep: a.bidStep,
  highestBid: a.highestBid,
  currentPrice: a.highestBid ?? a.startingPrice,
  minNextBid: a.highestBid ? a.highestBid + 1 : a.startingPrice,
  bidCount: a.bidCount,
});

export const toListDto = (a) => ({
  id: a.id,
  title: a.title,
  image: a.images?.[0] ?? null,
  ...prices(a),
  startsAt: a.startsAt,
  endsAt: a.endsAt,
  status: getStatus(a),
  createdBy: a.createdBy,
});

export const toDetailDto = (a) => {
  const status = getStatus(a);
  const top = a.bids?.[0];
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    images: a.images,
    ...prices(a),
    startsAt: a.startsAt,
    endsAt: a.endsAt,
    status,
    createdBy: a.createdBy,
    winner:
      status === "ENDED" && top
        ? { userId: top.bidder.id, name: top.bidder.name, amount: top.amount }
        : null,
    bids:
      a.bids?.map((b) => ({
        id: b.id,
        amount: b.amount,
        createdAt: b.createdAt,
        bidder: b.bidder,
      })) ?? [],
    serverTime: new Date().toISOString(),
  };
};
