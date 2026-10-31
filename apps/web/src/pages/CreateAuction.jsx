import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateAuctionMutation } from "../app/api";
import { formatINR, errorMessage } from "../utils/format";

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80",
];

export default function CreateAuction() {
  const navigate = useNavigate();
  const [createAuction, { isLoading }] = useCreateAuctionMutation();

  // Form states
  const [title, setTitle] = useState("Vintage Leica M3 Rangefinder");
  const [category, setCategory] = useState("Collectibles");
  const [description, setDescription] = useState(
    "Mint condition, single-owner vintage rangefinder camera with original Summicron 50mm f/2 lens. Fully serviced and verified."
  );
  const [images, setImages] = useState([
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [startingPrice, setStartingPrice] = useState("15000");
  const [bidStep, setBidStep] = useState("1000");
  const [startMode, setStartMode] = useState("now"); // 'now' | 'schedule'
  const [scheduledStartTime, setScheduledStartTime] = useState("");
  const [durationPreset, setDurationPreset] = useState("1h"); // '5m' | '15m' | '1h' | '24h' | 'custom'
  const [customEndDateTime, setCustomEndDateTime] = useState("");

  const [formError, setFormError] = useState(null);

  // Add image handler
  const handleAddImage = (urlToAdd) => {
    const url = (urlToAdd || newImageUrl).trim();
    if (!url) return;
    if (!url.startsWith("https://")) {
      setFormError("Images must use secure https:// URLs.");
      return;
    }
    if (images.length >= 5) {
      setFormError("Maximum of 5 images allowed.");
      return;
    }
    setImages([...images, url]);
    setNewImageUrl("");
    setFormError(null);
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleInsertSample = () => {
    const randomImg = SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
    if (images.length < 5) {
      setImages([...images, randomImg]);
    }
  };

  // Compute preview duration text
  const previewDurationText = useMemo(() => {
    if (durationPreset === "5m") return "00:05:00";
    if (durationPreset === "15m") return "00:15:00";
    if (durationPreset === "1h") return "01:00:00";
    if (durationPreset === "24h") return "24:00:00";
    if (customEndDateTime) return "Custom End Date";
    return "01:00:00";
  }, [durationPreset, customEndDateTime]);

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (images.length === 0) {
      setFormError("Please add at least one image URL.");
      return;
    }

    const priceNum = Number(startingPrice);
    if (!priceNum || priceNum < 1) {
      setFormError("Starting price must be at least ₹1.");
      return;
    }

    const stepNum = Number(bidStep) || 100;
    if (stepNum < 1) {
      setFormError("Bid step must be at least ₹1.");
      return;
    }

    // Determine start time and end time
    const now = new Date();
    let startsAt = now;
    if (startMode === "schedule" && scheduledStartTime) {
      const scheduledDate = new Date(scheduledStartTime);
      if (scheduledDate > now) {
        startsAt = scheduledDate;
      }
    }

    let endsAt;
    if (durationPreset === "5m") {
      endsAt = new Date(startsAt.getTime() + 5 * 60_000);
    } else if (durationPreset === "15m") {
      endsAt = new Date(startsAt.getTime() + 15 * 60_000);
    } else if (durationPreset === "1h") {
      endsAt = new Date(startsAt.getTime() + 60 * 60_000);
    } else if (durationPreset === "24h") {
      endsAt = new Date(startsAt.getTime() + 24 * 60 * 60_000);
    } else if (durationPreset === "custom" && customEndDateTime) {
      endsAt = new Date(customEndDateTime);
    } else {
      endsAt = new Date(startsAt.getTime() + 60 * 60_000); // 1h default
    }

    if (endsAt.getTime() <= startsAt.getTime()) {
      setFormError("Auction end time must be after the start time.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      images,
      startingPrice: priceNum,
      bidStep: stepNum,
      endsAt: endsAt.toISOString(),
      ...(startMode === "schedule" && scheduledStartTime ? { startsAt: startsAt.toISOString() } : {}),
    };

    try {
      const result = await createAuction(payload).unwrap();
      navigate(`/auctions/${result.id}`);
    } catch (err) {
      setFormError(errorMessage(err));
    }
  };

  const previewImage = images[0] || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80";

  return (
    <div className="flex flex-col w-full pb-20 bg-surface">
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 flex flex-col gap-space-xl">
            {/* Header */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-tertiary text-xs uppercase tracking-wider font-bold">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Asset Submission Portal</span>
              </div>
              <h1 className="text-headline-lg text-on-surface font-headline-lg font-bold tracking-tight">
                Create New Auction
              </h1>
              <p className="text-body-lg text-on-surface-variant">
                List your verified asset liquidation or rare collectible for timed bidding.
              </p>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="p-4 bg-error-container text-on-error-container rounded-2xl flex items-start gap-3 border border-error/30 animate-fadeIn">
                <span className="material-symbols-outlined text-error text-[22px] shrink-0">error</span>
                <div className="flex-1 text-body-sm">
                  <div className="font-bold mb-0.5">Submission Error</div>
                  <div>{formError}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormError(null)}
                  className="text-on-error-container hover:opacity-75"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            )}

            {/* Form Element */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* 1. Title */}
              <div className="flex flex-col gap-2 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/15">
                <label className="text-label-lg text-on-surface font-semibold" htmlFor="input-title">
                  Auction Title *
                </label>
                <input
                  id="input-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Signed Cricket Bat or Vintage Camera"
                  className="bg-surface-container text-on-surface px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-body-lg transition-all"
                />
              </div>

              {/* 2. Category */}
              <div className="flex flex-col gap-2 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/15">
                <label className="text-label-lg text-on-surface font-semibold" htmlFor="input-category">
                  Category *
                </label>
                <div className="relative">
                  <select
                    id="input-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary appearance-none text-body-md cursor-pointer transition-all pr-10"
                  >
                    <option value="Collectibles">Collectibles</option>
                    <option value="Sports Memorabilia">Sports Memorabilia</option>
                    <option value="Luxury Textiles">Luxury Textiles</option>
                    <option value="Musical Instruments">Musical Instruments</option>
                    <option value="Experiences">Experiences</option>
                    <option value="Fine Art">Fine Art</option>
                    <option value="Watches & Jewelry">Watches &amp; Jewelry</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* 3. Description */}
              <div className="flex flex-col gap-2 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/15">
                <label className="text-label-lg text-on-surface font-semibold" htmlFor="input-description">
                  Description &amp; Provenance
                </label>
                <textarea
                  id="input-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide clear provenance, condition notes, and item history."
                  className="bg-surface-container text-on-surface px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-body-md resize-none transition-all"
                />
                <span className="text-xs text-on-surface-variant">
                  Describe key specifications, historical certificates, and custody verification.
                </span>
              </div>

              {/* 4. Image URLs */}
              <div className="flex flex-col gap-3 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <label className="text-label-lg text-on-surface font-semibold">
                    Asset Images (Up to 5) *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleInsertSample}
                      disabled={images.length >= 5}
                      className="text-xs text-tertiary hover:underline font-medium disabled:opacity-40"
                    >
                      + Insert Sample Image
                    </button>
                    <span className="text-xs text-on-surface-variant">
                      {images.length}/5 images
                    </span>
                  </div>
                </div>

                {/* Image List */}
                <div className="flex flex-col gap-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-surface-container p-2.5 rounded-xl border border-outline-variant/20"
                    >
                      <img
                        src={img}
                        alt={`Asset ${idx + 1}`}
                        className="w-12 h-12 rounded-lg object-cover bg-surface-bright shrink-0"
                      />
                      <span className="flex-1 text-xs text-on-surface truncate font-mono">
                        {img}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded-lg hover:bg-surface-container-high"
                        title="Remove image"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new image row */}
                {images.length < 5 && (
                  <div className="flex gap-2 items-center pt-1">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="flex-1 bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-secondary text-body-md transition-all placeholder:text-on-surface-variant/50"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddImage()}
                      className="bg-primary hover:bg-primary-fixed-dim text-on-primary px-5 py-2.5 rounded-xl text-label-lg font-semibold transition-all shrink-0"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* 5 & 6. Starting Price & Bid Step */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-2 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/15">
                  <label className="text-label-lg text-on-surface font-semibold" htmlFor="input-price">
                    Starting Price (₹) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-tertiary font-bold text-lg pointer-events-none">
                      ₹
                    </span>
                    <input
                      id="input-price"
                      type="number"
                      required
                      min={1}
                      value={startingPrice}
                      onChange={(e) => setStartingPrice(e.target.value)}
                      className="w-full bg-surface-container text-on-surface pl-9 pr-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-secondary font-bold text-lg font-tabular-price transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/15">
                  <label className="text-label-lg text-on-surface font-semibold" htmlFor="input-step">
                    Bid Step (₹) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-tertiary font-bold text-lg pointer-events-none">
                      ₹
                    </span>
                    <input
                      id="input-step"
                      type="number"
                      required
                      min={1}
                      value={bidStep}
                      onChange={(e) => setBidStep(e.target.value)}
                      className="w-full bg-surface-container text-on-surface pl-9 pr-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-secondary font-bold text-lg font-tabular-price transition-all"
                    />
                  </div>
                  <span className="text-xs text-on-surface-variant">
                    Increment used for one-click quick-bid suggestions.
                  </span>
                </div>
              </div>

              {/* 7. Start Time */}
              <div className="flex flex-col gap-3 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/15">
                <label className="text-label-lg text-on-surface font-semibold">
                  Start Schedule
                </label>
                <div className="flex bg-surface-container p-1 rounded-xl w-fit border border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setStartMode("now")}
                    className={`px-4 py-1.5 rounded-lg text-label-md font-medium transition-all ${
                      startMode === "now"
                        ? "bg-primary text-on-primary font-bold shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Start Now (Immediate)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStartMode("schedule")}
                    className={`px-4 py-1.5 rounded-lg text-label-md font-medium transition-all ${
                      startMode === "schedule"
                        ? "bg-primary text-on-primary font-bold shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Schedule Future Start
                  </button>
                </div>

                {startMode === "schedule" && (
                  <div className="flex flex-col gap-1.5 pt-2">
                    <input
                      type="datetime-local"
                      value={scheduledStartTime}
                      onChange={(e) => setScheduledStartTime(e.target.value)}
                      className="bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-secondary text-body-md transition-all"
                    />
                    <span className="text-xs text-on-surface-variant">
                      Item will remain in "Upcoming" state until this timestamp.
                    </span>
                  </div>
                )}
              </div>

              {/* 8. Duration */}
              <div className="flex flex-col gap-3 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/15">
                <label className="text-label-lg text-on-surface font-semibold">
                  Auction Duration
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "5m", label: "5 min (Demo)" },
                    { key: "15m", label: "15 min" },
                    { key: "1h", label: "1 hour" },
                    { key: "24h", label: "24 hours" },
                    { key: "custom", label: "Custom End" },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setDurationPreset(p.key)}
                      className={`px-4 py-2 rounded-xl text-label-md font-medium transition-all ${
                        durationPreset === p.key
                          ? "bg-primary text-on-primary font-bold shadow-sm"
                          : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-bright"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {durationPreset === "custom" && (
                  <div className="flex flex-col gap-1.5 pt-2">
                    <input
                      type="datetime-local"
                      value={customEndDateTime}
                      onChange={(e) => setCustomEndDateTime(e.target.value)}
                      className="bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-secondary text-body-md transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Form Action */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-fixed-dim text-on-primary font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        progress_activity
                      </span>
                      <span>Creating Auction...</span>
                    </>
                  ) : (
                    <>
                      <span>Publish Auction</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Real-Time Live Preview Card */}
          <div className="lg:col-span-5 sticky top-24 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-tertiary">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                <span className="text-xs font-bold uppercase tracking-wider">Live Preview Card</span>
              </div>
              <span className="text-xs text-on-surface-variant">Updates synchronously</span>
            </div>

            {/* Live Preview Card */}
            <div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/20 flex flex-col transition-all">
              <div className="relative aspect-[4/3] w-full bg-surface-container-lowest overflow-hidden">
                <img
                  src={previewImage}
                  alt="Live preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-surface/85 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-emerald-300 font-medium flex items-center gap-1 border border-emerald-500/20 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {startMode === "now" ? "Live" : "Upcoming"}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-surface/85 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-on-surface font-medium border border-outline-variant/20 shadow-md">
                  {category}
                </div>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-headline-sm text-on-surface font-headline-sm font-semibold truncate">
                    {title || "Untitled Lot Asset"}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant line-clamp-2">
                    {description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/15">
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider">
                      Starting Price
                    </span>
                    <span className="text-xl text-tertiary font-bold font-tabular-price">
                      {formatINR(Number(startingPrice) || 0)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider">
                      Scheduled Duration
                    </span>
                    <span className="text-body-md text-on-surface font-mono font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">schedule</span>
                      <span>{previewDurationText}</span>
                    </span>
                  </div>
                </div>

                <div className="w-full bg-surface-container-high/60 text-on-surface-variant py-2.5 rounded-xl text-label-lg font-medium text-center">
                  Live Lot Simulation
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl flex items-start gap-2 text-xs text-on-surface-variant border border-outline-variant/15">
              <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0">info</span>
              <p>
                All lots are deployed with instant event synchronization. Once published, bids can be placed immediately by participants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
