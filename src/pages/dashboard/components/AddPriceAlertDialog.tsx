import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CITIES = [
  "Qualquer",
  "Caerleon",
  "Bridgewatch",
  "Martlock",
  "Lymhurst",
  "Thetford",
  "Fort Sterling",
  "Brecilien",
];

type AlertRuleType = "target" | "manual_percent" | "ai_percent";

interface AddPriceAlertDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemDisplayName: string;
}

export function AddPriceAlertDialog({
  isOpen,
  onOpenChange,
  itemName,
  itemDisplayName,
}: AddPriceAlertDialogProps) {
  const { t } = useTranslation();
  const [ruleType, setRuleType] = useState<AlertRuleType>("target");
  const [targetPriceInput, setTargetPriceInput] = useState("");
  const [expectedPriceInput, setExpectedPriceInput] = useState("");
  const [percentBelowInput, setPercentBelowInput] = useState("20");
  const [cityInput, setCityInput] = useState("Qualquer");
  const [qualityInput, setQualityInput] = useState("");
  const [cooldownInput, setCooldownInput] = useState("60");
  const [alertError, setAlertError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRuleType("target");
      setTargetPriceInput("");
      setExpectedPriceInput("");
      setPercentBelowInput("20");
      setCityInput("Qualquer");
      setQualityInput("");
      setCooldownInput("60");
      setAlertError(null);
    }
  }, [isOpen]);

  const parseNumberInput = (value: string): number => {
    const normalized = value.trim().replace(/\./g, "").replace(",", ".");
    return Number(normalized);
  };

  const parseIntegerInput = (value: string): number => {
    return Number(String(value).trim());
  };

  const handleConfirmAlert = () => {
    const cooldown = parseIntegerInput(cooldownInput);
    if (!Number.isFinite(cooldown) || cooldown < 0) {
      setAlertError("Cooldown inválido.");
      return;
    }

    const city = cityInput === "Qualquer" ? null : cityInput;
    const qualityParsed = qualityInput.trim() ? parseIntegerInput(qualityInput) : null;
    if (qualityParsed !== null && (!Number.isFinite(qualityParsed) || qualityParsed < 1 || qualityParsed > 5)) {
      setAlertError("Qualidade deve estar entre 1 e 5.");
      return;
    }

    let detail: Record<string, unknown> = {
      itemName: itemName,
      displayName: itemDisplayName,
      city,
      quality: qualityParsed,
      cooldownMinutes: cooldown,
    };

    if (ruleType === "target") {
      const value = parseNumberInput(targetPriceInput);
      if (!Number.isFinite(value) || value <= 0) {
        setAlertError(t("dashboard.invalidAlertPrice") as string);
        return;
      }
      detail = {
        ...detail,
        ruleType,
        targetPrice: value,
      };
    } else if (ruleType === "manual_percent") {
      const expectedPrice = parseNumberInput(expectedPriceInput);
      const percentBelow = parseNumberInput(percentBelowInput);
      if (!Number.isFinite(expectedPrice) || expectedPrice <= 0) {
        setAlertError("Preço esperado inválido.");
        return;
      }
      if (!Number.isFinite(percentBelow) || percentBelow <= 0 || percentBelow >= 100) {
        setAlertError("Percentual deve ser maior que 0 e menor que 100.");
        return;
      }
      detail = {
        ...detail,
        ruleType,
        expectedPrice,
        percentBelow,
      };
    } else {
      const percentBelow = parseNumberInput(percentBelowInput);
      if (!Number.isFinite(percentBelow) || percentBelow <= 0 || percentBelow >= 100) {
        setAlertError("Percentual deve ser maior que 0 e menor que 100.");
        return;
      }
      detail = {
        ...detail,
        ruleType,
        percentBelow,
        useAiExpected: true,
      };
    }

    const event = new CustomEvent("dashboard:add-alert", { detail });
    window.dispatchEvent(event);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border/60 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tight">
            {t("dashboard.alertModalTitle")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium pt-2">
            {t("dashboard.alertModalDescription", {
              item: itemDisplayName,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Regra
            </Label>
            <select
              value={ruleType}
              onChange={(e) => {
                setRuleType(e.target.value as AlertRuleType);
                setAlertError(null);
              }}
              className="h-10 rounded-md border border-border/40 bg-background/50 px-3 text-sm"
            >
              <option value="target">Preço alvo fixo</option>
              <option value="manual_percent">% abaixo de preço esperado (manual)</option>
              <option value="ai_percent">% abaixo de preço esperado (IA/histórico)</option>
            </select>
          </div>

          <div className="grid gap-2">
            {ruleType === "target" && (
              <>
                <Label
                  htmlFor="price"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  {t("dashboard.alertModalPriceLabel")}
                </Label>
                <Input
                  id="price"
                  type="text"
                  inputMode="decimal"
                  value={targetPriceInput}
                  onChange={(e) => {
                    setTargetPriceInput(e.target.value);
                    if (alertError) setAlertError(null);
                  }}
                  placeholder={(t("dashboard.alertModalPricePlaceholder") as string) || "150.000"}
                  className="bg-background/50 border-border/40 focus:ring-primary/40 focus:border-primary/60 font-mono"
                />
              </>
            )}

            {ruleType === "manual_percent" && (
              <>
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Preço esperado (manual)
                </Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={expectedPriceInput}
                  onChange={(e) => {
                    setExpectedPriceInput(e.target.value);
                    if (alertError) setAlertError(null);
                  }}
                  placeholder="200.000"
                  className="bg-background/50 border-border/40 font-mono"
                />
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Percentual abaixo
                </Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={percentBelowInput}
                  onChange={(e) => {
                    setPercentBelowInput(e.target.value);
                    if (alertError) setAlertError(null);
                  }}
                  placeholder="20"
                  className="bg-background/50 border-border/40 font-mono"
                />
              </>
            )}

            {ruleType === "ai_percent" && (
              <>
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Percentual abaixo do esperado (IA)
                </Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={percentBelowInput}
                  onChange={(e) => {
                    setPercentBelowInput(e.target.value);
                    if (alertError) setAlertError(null);
                  }}
                  placeholder="20"
                  className="bg-background/50 border-border/40 font-mono"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Cidade
              </Label>
              <select
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="h-10 rounded-md border border-border/40 bg-background/50 px-3 text-sm"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Qualidade (1-5)
              </Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={qualityInput}
                onChange={(e) => setQualityInput(e.target.value)}
                placeholder="Opcional"
                className="bg-background/50 border-border/40"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Cooldown (min)
            </Label>
            <Input
              type="number"
              min={0}
              value={cooldownInput}
              onChange={(e) => setCooldownInput(e.target.value)}
              className="bg-background/50 border-border/40"
            />
            {alertError && (
              <p className="text-[11px] font-bold text-destructive animate-pulse mt-1">
                {alertError}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="font-bold uppercase tracking-widest text-[10px]"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirmAlert}
            className="bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
          >
            {t("dashboard.alertModalConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
