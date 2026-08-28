"use client";

import { useRef, useState } from "react";
import {
  DESIRE_OPTIONS,
  TIMING_OPTIONS,
  WEEKLY_HOURS_OPTIONS,
} from "@/lib/constants";

const inputClass =
  "w-full rounded-xl border border-navy/20 bg-white px-4 py-3 text-base text-navy placeholder:text-navy/40 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";
const labelClass = "block text-sm font-bold text-navy";

export default function ApplicationForm() {
  const [desire, setDesire] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [desiredTiming, setDesiredTiming] = useState("");
  const [managedExperience, setManagedExperience] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("");
  const [agreeApplyWeek3, setAgreeApplyWeek3] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inFlight = useRef(false); // 二重送信防止

  const isCareer = desire === "career";

  function validate(): string[] {
    const list: string[] = [];
    if (!desire) list.push("ご希望を選択してください。");
    if (isCareer && !targetJob.trim())
      list.push("転職して就きたい仕事を入力してください。");
    if (isCareer && !desiredTiming) list.push("希望時期を選択してください。");
    if (!managedExperience.trim())
      list.push("これまでの仕事で判断・管理していたことを入力してください。");
    if (!weeklyHours) list.push("週に確保できる時間を選択してください。");
    if (isCareer && !agreeApplyWeek3)
      list.push("3週目から応募が始まることへの同意が必要です。");
    if (!name.trim()) list.push("氏名を入力してください。");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      list.push("メールアドレスを正しく入力してください。");
    return list;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;

    const clientErrors = validate();
    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    setErrors([]);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          desire,
          targetJob: isCareer ? targetJob : undefined,
          desiredTiming: isCareer ? desiredTiming : undefined,
          managedExperience,
          weeklyHours,
          agreeApplyWeek3: isCareer ? agreeApplyWeek3 : undefined,
          name,
          email,
          phone: phone || undefined,
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setSubmitted(true);
      } else {
        setErrors(
          json?.errors ?? [
            "送信に失敗しました。時間をおいて再度お試しください。",
          ]
        );
      }
    } catch {
      setErrors(["送信に失敗しました。通信環境をご確認のうえ再度お試しください。"]);
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center sm:p-10">
        <p className="text-4xl" aria-hidden>
          ✉️
        </p>
        <h3 className="mt-4 text-xl font-bold">
          お申し込みを受け付けました
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-navy/80 sm:text-base">
          24時間以内にメールでご案内します。
          <br />
          迷惑メールフォルダもあわせてご確認ください。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      {/* 設問1 */}
      <fieldset>
        <legend className={labelClass}>
          ご希望 <Required />
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {DESIRE_OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-base ${
                desire === o.value
                  ? "border-teal bg-teal/5 font-bold"
                  : "border-navy/20 bg-white"
              }`}
            >
              <input
                type="radio"
                name="desire"
                value={o.value}
                checked={desire === o.value}
                onChange={() => setDesire(o.value)}
                className="h-4 w-4 accent-teal"
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* 設問2（転職希望のみ） */}
      {isCareer && (
        <div>
          <label htmlFor="targetJob" className={labelClass}>
            転職して就きたい仕事 <Required />
          </label>
          <p className="mt-1 text-xs text-navy/60">
            職種や業界など、いまの時点で考えているものをお書きください。
          </p>
          <textarea
            id="targetJob"
            value={targetJob}
            onChange={(e) => setTargetJob(e.target.value)}
            rows={3}
            maxLength={2000}
            className={`${inputClass} mt-2`}
            placeholder="例：飲食業界の本部で、店舗運営を支える事務職（SV補佐・営業企画など）"
          />
        </div>
      )}

      {/* 設問3（転職希望のみ） */}
      {isCareer && (
        <div>
          <label htmlFor="desiredTiming" className={labelClass}>
            希望時期 <Required />
          </label>
          <select
            id="desiredTiming"
            value={desiredTiming}
            onChange={(e) => setDesiredTiming(e.target.value)}
            className={`${inputClass} mt-2`}
          >
            <option value="">選択してください</option>
            {TIMING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 設問4 */}
      <div>
        <label htmlFor="managedExperience" className={labelClass}>
          これまでの仕事で、自分が判断・管理していたこと <Required />
        </label>
        <p className="mt-1 text-xs text-navy/60">
          シフト作成、発注、クレーム対応、工程・予算・人の管理など、ご自身で判断していたことをお書きください。
        </p>
        <textarea
          id="managedExperience"
          value={managedExperience}
          onChange={(e) => setManagedExperience(e.target.value)}
          rows={4}
          maxLength={2000}
          className={`${inputClass} mt-2`}
          placeholder="例：店長として売上目標に合わせたシフト・発注量の調整、アルバイト10名の採用と教育を担当"
        />
      </div>

      {/* 設問5 */}
      <div>
        <label htmlFor="weeklyHours" className={labelClass}>
          週に確保できる時間 <Required />
        </label>
        <select
          id="weeklyHours"
          value={weeklyHours}
          onChange={(e) => setWeeklyHours(e.target.value)}
          className={`${inputClass} mt-2`}
        >
          <option value="">選択してください</option>
          {WEEKLY_HOURS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* 設問6（転職希望のみ） */}
      {isCareer && (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-accent/40 bg-accent/5 p-4">
          <input
            type="checkbox"
            checked={agreeApplyWeek3}
            onChange={(e) => setAgreeApplyWeek3(e.target.checked)}
            className="mt-1 h-4 w-4 accent-accent"
          />
          <span className="text-sm leading-relaxed">
            <span className="font-bold">
              3週目から実際の応募が始まること
            </span>
            に同意します <Required />
          </span>
        </label>
      )}

      <hr className="border-navy/10" />

      {/* 連絡先 */}
      <div className="space-y-5">
        <div>
          <label htmlFor="name" className={labelClass}>
            氏名 <Required />
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
            autoComplete="name"
            className={`${inputClass} mt-2`}
            placeholder="例：山田 太郎"
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            メールアドレス <Required />
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={200}
            autoComplete="email"
            className={`${inputClass} mt-2`}
            placeholder="例：taro@example.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            電話番号（任意）
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
            autoComplete="tel"
            className={`${inputClass} mt-2`}
            placeholder="例：090-1234-5678"
          />
        </div>
      </div>

      {errors.length > 0 && (
        <div
          role="alert"
          className="rounded-xl border border-accent/50 bg-accent/10 p-4 text-sm text-navy"
        >
          <ul className="list-disc space-y-1 pl-5">
            {errors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-accent px-8 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
      >
        {submitting ? "送信中…" : "この内容で申し込む"}
      </button>
      <p className="text-center text-xs leading-relaxed text-navy/60">
        送信いただいた内容は
        <a href="/privacy" className="underline underline-offset-2">
          プライバシーポリシー
        </a>
        に基づいて取り扱います。
      </p>
    </form>
  );
}

function Required() {
  return (
    <span className="ml-1 align-middle text-xs font-bold text-accent">必須</span>
  );
}
