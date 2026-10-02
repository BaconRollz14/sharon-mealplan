"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { PackagePlus, Trash2 } from "lucide-react";
import type { WeekPlan } from "../cookbook-data";
import {
  getFreshnessProductsForWeek,
  isValidISODate,
  type FreshnessProductOption,
  type PurchasedLot,
  type ScheduleEvaluation,
} from "../freshness-planner";
import type { MorrisonsProductId } from "../morrisons-pricing";

interface FreshnessPanelProps {
  week: WeekPlan;
  weekStartISO: string;
  lots: PurchasedLot[];
  evaluation: ScheduleEvaluation;
  onAddLot: (lot: PurchasedLot) => void;
  onUpdateLot: (lot: PurchasedLot) => void;
  onRemoveLot: (lotId: string) => void;
  onOptimise: () => void;
}

function localDateISO() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function readableDate(value: string) {
  if (!isValidISODate(value)) return "date not set";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(`${value}T00:00:00Z`));
}

function newLotId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `lot-${Date.now()}`;
}

export function FreshnessPanel({
  week,
  weekStartISO,
  lots,
  evaluation,
  onAddLot,
  onUpdateLot,
  onRemoveLot,
  onOptimise,
}: FreshnessPanelProps) {
  const options = useMemo(() => getFreshnessProductsForWeek(week), [week]);
  const [formOpen, setFormOpen] = useState(false);
  const [productId, setProductId] = useState<MorrisonsProductId | "">(options[0]?.productId ?? "");
  const [quantity, setQuantity] = useState(options[0] ? String(options[0].defaultQuantity) : "");
  const today = localDateISO();
  const [purchasedOn, setPurchasedOn] = useState(today);
  const [useByDate, setUseByDate] = useState(weekStartISO > today ? weekStartISO : today);
  const [formError, setFormError] = useState("");
  const [formErrorField, setFormErrorField] = useState<"product" | "quantity" | "purchasedOn" | "useByDate" | null>(null);
  const productRef = useRef<HTMLSelectElement | null>(null);
  const quantityRef = useRef<HTMLInputElement | null>(null);
  const purchasedOnRef = useRef<HTMLInputElement | null>(null);
  const useByDateRef = useRef<HTMLInputElement | null>(null);

  const selectedProduct: FreshnessProductOption | undefined = options.find((option) => option.productId === productId) ?? options[0];

  const selectProduct = (nextProductId: string) => {
    const next = options.find((option) => option.productId === nextProductId);
    if (next) {
      setProductId(next.productId);
      setQuantity(String(next.defaultQuantity));
    }
  };

  const submitLot = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedQuantity = Number(quantity);
    if (!selectedProduct || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setFormErrorField(!selectedProduct ? "product" : "quantity");
      setFormError("Enter the amount in the pack, greater than zero.");
      window.requestAnimationFrame(() => (!selectedProduct ? productRef.current : quantityRef.current)?.focus());
      return;
    }
    if (!isValidISODate(purchasedOn) || !isValidISODate(useByDate)) {
      const field = !isValidISODate(purchasedOn) ? "purchasedOn" : "useByDate";
      setFormErrorField(field);
      setFormError("Enter both the purchase date and the use-by date.");
      window.requestAnimationFrame(() => (field === "purchasedOn" ? purchasedOnRef.current : useByDateRef.current)?.focus());
      return;
    }
    if (useByDate < purchasedOn) {
      setFormErrorField("useByDate");
      setFormError("The use-by date cannot be before the purchase date.");
      window.requestAnimationFrame(() => useByDateRef.current?.focus());
      return;
    }
    onAddLot({
      id: newLotId(),
      productId: selectedProduct.productId,
      productName: selectedProduct.productName,
      quantity: parsedQuantity,
      unit: selectedProduct.unit,
      purchasedOn,
      useByDate,
    });
    setFormOpen(false);
    setFormError("");
    setFormErrorField(null);
  };

  const blockingIssues = evaluation.issues.filter((issue) => issue.severity === "error");
  const missingLotCount = evaluation.issues.filter((issue) => issue.code === "missing-lot").length;

  return (
    <section className="freshness-panel" aria-labelledby={`freshness-title-w${week.number}`}>
      <div className="freshness-heading">
        <div>
          <h3 id={`freshness-title-w${week.number}`}>Use-by dates for this shop</h3>
          <p>Record each fresh or chilled meat pack separately. The optimiser allocates measured recipe quantities from the earliest-expiring pack first.</p>
        </div>
        <button type="button" className="button button-secondary freshness-add" onClick={() => { setFormOpen((open) => !open); setFormError(""); }} disabled={!options.length}>
          <PackagePlus aria-hidden="true" />{formOpen ? "Close" : "Add a pack"}
        </button>
      </div>

      <p className="freshness-week-note">Week {week.number} · {readableDate(weekStartISO)} start. A pack can be used from its purchase date through its use-by date; partial packs are allocated as they are used.</p>

      {formOpen ? (
        <form className="freshness-form" onSubmit={submitLot}>
          <div className="freshness-form-fields">
            <label htmlFor={`freshness-product-w${week.number}`}>Product<select ref={productRef} id={`freshness-product-w${week.number}`} value={selectedProduct?.productId ?? ""} onChange={(event) => selectProduct(event.target.value)} required aria-invalid={formErrorField === "product" || undefined} aria-describedby={formError ? `freshness-form-error-w${week.number}` : undefined}>{options.map((option) => <option key={option.productId} value={option.productId}>{option.productName} · {option.packSize}</option>)}</select></label>
            <label htmlFor={`freshness-quantity-w${week.number}`}>Pack quantity<input ref={quantityRef} id={`freshness-quantity-w${week.number}`} type="number" min="0.1" step="0.1" value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="decimal" required aria-invalid={formErrorField === "quantity" || undefined} aria-describedby={formError ? `freshness-form-error-w${week.number}` : undefined} /><span>{selectedProduct?.unit ?? "unit"}</span></label>
            <label htmlFor={`freshness-purchased-w${week.number}`}>Purchased on<input ref={purchasedOnRef} id={`freshness-purchased-w${week.number}`} type="date" value={purchasedOn} onChange={(event) => setPurchasedOn(event.target.value)} required aria-invalid={formErrorField === "purchasedOn" || undefined} aria-describedby={formError ? `freshness-form-error-w${week.number}` : undefined} /></label>
            <label htmlFor={`freshness-use-by-w${week.number}`}>Use by<input ref={useByDateRef} id={`freshness-use-by-w${week.number}`} type="date" value={useByDate} onChange={(event) => setUseByDate(event.target.value)} required aria-invalid={formErrorField === "useByDate" || undefined} aria-describedby={formError ? `freshness-form-error-w${week.number}` : undefined} /></label>
          </div>
          {formError ? <p id={`freshness-form-error-w${week.number}`} className="form-error" role="alert">{formError}</p> : null}
          <div className="freshness-form-actions"><button type="submit" className="button button-primary">Save pack</button><button type="button" className="button button-secondary" onClick={() => { setFormOpen(false); setFormError(""); setFormErrorField(null); }}>Cancel</button></div>
        </form>
      ) : null}

      {lots.length ? (
        <div className="freshness-lots" aria-label={`Recorded packs for Week ${week.number}`}>
          {lots.map((lot) => {
            const invalidDateRange = !isValidISODate(lot.purchasedOn) || !isValidISODate(lot.useByDate) || lot.useByDate < lot.purchasedOn;
            const lotErrorId = `freshness-lot-error-${lot.id}`;
            const lotTitleId = `freshness-lot-title-${lot.id}`;
            const lotDescribedBy = invalidDateRange ? `${lotTitleId} ${lotErrorId}` : lotTitleId;
            return (
              <div className="freshness-lot" key={lot.id}>
                <div className="freshness-lot-title"><strong id={lotTitleId}>{lot.productName}</strong><span>{lot.quantity} {lot.unit}</span></div>
                <label htmlFor={`freshness-lot-purchased-${lot.id}`}>Purchased<input id={`freshness-lot-purchased-${lot.id}`} type="date" value={lot.purchasedOn} onChange={(event) => onUpdateLot({ ...lot, purchasedOn: event.target.value })} aria-invalid={invalidDateRange || undefined} aria-describedby={lotDescribedBy} /></label>
                <label htmlFor={`freshness-lot-use-by-${lot.id}`}>Use by<input id={`freshness-lot-use-by-${lot.id}`} type="date" value={lot.useByDate} onChange={(event) => onUpdateLot({ ...lot, useByDate: event.target.value })} aria-invalid={invalidDateRange || undefined} aria-describedby={lotDescribedBy} /></label>
                {invalidDateRange ? <span id={lotErrorId} className="sr-only">The purchase date must be on or before the use-by date.</span> : null}
                <button type="button" className="freshness-remove" onClick={() => onRemoveLot(lot.id)} aria-label={`Remove ${lot.productName} pack`}><Trash2 aria-hidden="true" /></button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="freshness-empty"><strong>No pack dates recorded yet.</strong><span>Add every fresh/chilled meat pack you bought to unlock safe scheduling.</span></div>
      )}

      {blockingIssues.length ? (
        <div className="freshness-issues" role="alert" aria-live="polite">
          <strong>{blockingIssues.length === 1 ? "One freshness check needs attention." : `${blockingIssues.length} freshness checks need attention.`}</strong>
          <ul>{blockingIssues.map((issue, index) => <li key={`${issue.recipeId ?? "issue"}-${issue.productId ?? "product"}-${index}`}>{issue.message}</li>)}</ul>
        </div>
      ) : null}
      {missingLotCount ? <p className="freshness-missing" role="status">{missingLotCount} recipe {missingLotCount === 1 ? "use still needs" : "uses still need"} a dated pack. The current optimisation covers the recorded packs only.</p> : null}

      <div className="freshness-actions">
        <button type="button" className="button button-primary" onClick={onOptimise} disabled={!lots.length}>Optimise this week</button>
        <span>{lots.length ? (evaluation.feasible ? "All recorded pack quantities fit the current order." : "The optimiser will keep cooked dinners fixed and look for a safe order.") : "Add pack dates first."}</span>
      </div>
    </section>
  );
}
