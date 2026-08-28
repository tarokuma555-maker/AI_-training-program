"use client";

import { useState } from "react";
import {
  type ApplicationInput,
  type ValidationErrors,
  DESIRED_TIMINGS,
  TIMING_LABELS,
  TRACK_LABELS,
  WEEKLY_HOURS,
  WEEKLY_HOURS_LABELS,
  validateApplication,
} from "@/lib/applications";
import { submitApplication } from "@/app/actions/submit-application";

const initialInput: ApplicationInput = {
  name: "",
  email: "",
  phone: "",
  desiredTrack: "",
  desiredJob: "",
  desiredTiming: "",
  judgmentExperience: "",
  weeklyHours: "",
  agreedWeek3Apply: false,
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-red-600">{message}</p>;
}

function Label({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="mb-2 block text-sm font-bold">
      {children}
      {required && (
        <span className="ml-2 rounded bg-accent/10 px-1.5 py-0.5 text-xs font-medium text-accent">
          必須
        </span>
      )}
    </span>
  );
}

const inputClass =
  "w-full rounded-xl border border-navy/20 bg-white px-4 py-3 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

export default function ApplicationForm() {
  const [input, setInput] = useState<ApplicationInput>(initialInput);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const isCareer = input.desiredTrack === "career";

  const set = <K extends keyof ApplicationInput>(
    key: K,
    value: ApplicationInput[K]
  ) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // 二重送信防止

    const validationErrors = validateApplication(input);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setServerMessage("");
      return;
    }

    setSubmitting(true);
    setServerMessage("");
    try {
      const result = await submitApplication(input);
      if (result.ok) {
        setDone(true);
      } else {
        setErrors(result.errors ?? {});
        setServerMessage(
          result.message ??
            "入力内容をご確認のうえ、再度お試しください。"
        );
      }
    } catch {
      setServerMessage(
        "送信に失敗しました。お手数ですが、時間をおいて再度お試しください。"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-2xl text-white">
          ✓
        </div>
        <h3 className="text-xl font-bold">お申込みを受け付けました</h3>
        <p className="mt-4 text-sm leading-relaxed text-navy/75">
          24時間以内にメールでご案内します。
          <br />
          メールが届かない場合は、迷惑メールフォルダもご確認ください。
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-8 rounded-2xl bg-white p-6 shadow-sm sm:p-10"
    >
      {/* 設問1 */}
      <div>
        <Label required>1. ご希望</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(TRACK_LABELS) as Array<keyof typeof TRACK_LABELS>).map(
            (track) => (
              <label
                key={track}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-medium transition ${
                  input.desiredTrack === track
                    ? "border-teal bg-teal/5 ring-2 ring-teal/30"
                    : "border-navy/20 hover:border-teal/50"
                }`}
              >
                <input
                  type="radio"
                  name="desiredTrack"
                  value={track}
                  checked={input.desiredTrack === track}
                  onChange={() => set("desiredTrack", track)}
                  className="h-4 w-4 accent-teal"
                />
                {TRACK_LABELS[track]}
              </label>
            )
          )}
        </div>
        <FieldError message={errors.desiredTrack} />
      </div>

      {/* 設問2（転職希望のみ） */}
      {isCareer && (
        <div>
          <Label required>2. 転職して就きたい仕事</Label>
          <textarea
            value={input.desiredJob}
            onChange={(e) => set("desiredJob", e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="例：飲食業界の本部で、店舗運営を支えるスーパーバイザーや事務職に就きたい"
            className={inputClass}
          />
          <FieldError message={errors.desiredJob} />
        </div>
      )}

      {/* 設問3（転職希望のみ） */}
      {isCareer && (
        <div>
          <Label required>3. 希望時期</Label>
          <select
            value={input.desiredTiming}
            onChange={(e) =>
              set(
                "desiredTiming",
                e.target.value as ApplicationInput["desiredTiming"]
              )
            }
            className={inputClass}
          >
            <option value="">選択してください</option>
            {DESIRED_TIMINGS.map((t) => (
              <option key={t} value={t}>
                {TIMING_LABELS[t]}
              </option>
            ))}
          </select>
          <FieldError message={errors.desiredTiming} />
        </div>
      )}

      {/* 設問4 */}
      <div>
        <Label required>
          {isCareer ? "4. " : "2. "}
          これまでの仕事で、自分が判断・管理していたこと
        </Label>
        <textarea
          value={input.judgmentExperience}
          onChange={(e) => set("judgmentExperience", e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="例：店舗の売上目標に対する日々の発注量の決定、アルバイト12名のシフト管理と育成"
          className={inputClass}
        />
        <FieldError message={errors.judgmentExperience} />
      </div>

      {/* 設問5 */}
      <div>
        <Label required>
          {isCareer ? "5. " : "3. "}週に確保できる時間
        </Label>
        <select
          value={input.weeklyHours}
          onChange={(e) =>
            set("weeklyHours", e.target.value as ApplicationInput["weeklyHours"])
          }
          className={inputClass}
        >
          <option value="">選択してください</option>
          {WEEKLY_HOURS.map((h) => (
            <option key={h} value={h}>
              {WEEKLY_HOURS_LABELS[h]}
            </option>
          ))}
        </select>
        <FieldError message={errors.weeklyHours} />
      </div>

      {/* 設問6（転職希望のみ） */}
      {isCareer && (
        <div>
          <Label required>6. 応募開始への同意</Label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy/20 px-4 py-3.5 text-sm">
            <input
              type="checkbox"
              checked={input.agreedWeek3Apply}
              onChange={(e) => set("agreedWeek3Apply", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-teal"
            />
            <span>
              プログラム3週目から実際の応募が始まることに同意します
            </span>
          </label>
          <FieldError message={errors.agreedWeek3Apply} />
        </div>
      )}

      <hr className="border-navy/10" />

      {/* 連絡先 */}
      <div>
        <Label required>氏名</Label>
        <input
          type="text"
          value={input.name}
          onChange={(e) => set("name", e.target.value)}
          maxLength={100}
          autoComplete="name"
          className={inputClass}
        />
        <FieldError message={errors.name} />
      </div>

      <div>
        <Label required>メールアドレス</Label>
        <input
          type="email"
          value={input.email}
          onChange={(e) => set("email", e.target.value)}
          maxLength={254}
          autoComplete="email"
          className={inputClass}
        />
        <FieldError message={errors.email} />
      </div>

      <div>
        <Label>電話番号（任意）</Label>
        <input
          type="tel"
          value={input.phone}
          onChange={(e) => set("phone", e.target.value)}
          maxLength={20}
          autoComplete="tel"
          className={inputClass}
        />
        <FieldError message={errors.phone} />
      </div>

      {serverMessage && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-accent px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "送信中…" : "この内容で申し込む"}
      </button>
      <p className="text-center text-xs leading-relaxed text-navy/60">
        送信いただいた内容はAIによる一次判定の参考にします。
        受講可否の最終判断は運営者が行います。
      </p>
    </form>
  );
}
