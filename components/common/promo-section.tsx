import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Section from "@/components/layout/section";
import promoBg from "@/public/images/promo.png";
import dogWithSock from "@/public/images/dog-with-sock.svg";

// Constants
const PROMO_CONSTANTS = {
  BIG_NUMBER: "1000",
  MIN_HEIGHT: {
    mobile: "588px",
    desktop: "775px",
  },
  DOG_DIMENSIONS: {
    width: 109,
    height: 167,
  },
} as const;

// Style utilities
const styles = {
  container:
    "relative rounded-3xl overflow-hidden min-h-[588px] md:min-h-[775px]",
  contentWrapper:
    "relative z-10 w-full h-full px-4 sm:px-12 pt-4 sm:pt-12 pb-6 md:pb-10 min-h-[588px] md:min-h-[775px]",
  bigNumber:
    "pointer-events-none select-none font-geologica font-light text-white tracking-[-0.03em] leading-[0.95] text-[144px] sm:text-[300px] md:text-[381px] absolute left-[15px] md:left-[52px] top-[95px] sm:top-[82px]",
  description:
    "text-white text-lg text-[24px] font-medium sm:text-2xl md:text-[32px] md:leading-[1.05] max-w-[520px]",
  title: "font-geologica font-semibold text-white text-[40px] relative",
  ctaContainer:
    "absolute w-full pl-8 sm:w-auto bottom-4 right-4 sm:bottom-6 sm:right-8 md:bottom-8 md:right-10 flex flex-col items-end",
  ctaButton:
    "inline-flex items-center justify-center h-[56px] px-8 rounded-md bg-[#CCF28C] text-black text-sm md:text-base font-medium shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black transition w-full md:w-auto min-w-[230px]",
} as const;

// Sub-components
function PromoBackground({ backgroundAlt }: { backgroundAlt: string }) {
  return (
    <div className="absolute inset-0">
      <Image
        src={promoBg}
        alt={backgroundAlt}
        fill
        priority
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 1440px"
      />
      <div className="absolute inset-0 bg-black/25" />
    </div>
  );
}

function BigNumberDisplay({ number }: { number: string }) {
  return <div className={styles.bigNumber}>{number}</div>;
}

function PromoDescription({ description }: { description: string }) {
  return (
    <div className="absolute top-[calc(80px+175px-20px)] md:top-[calc(100px+381px-20px)] md:left-[135px]">
      <p className={styles.description}>{description}</p>
    </div>
  );
}

function DogIllustration({ dogAlt }: { dogAlt: string }) {
  return (
    <div
      className="relative pointer-events-none select-none"
      style={{
        width: PROMO_CONSTANTS.DOG_DIMENSIONS.width,
        height: PROMO_CONSTANTS.DOG_DIMENSIONS.height,
      }}
    >
      <Image
        src={dogWithSock}
        alt={dogAlt}
        fill
        className="object-contain"
        sizes={`${PROMO_CONSTANTS.DOG_DIMENSIONS.width}px`}
        priority
      />
    </div>
  );
}

function CTASection({
  dogAlt,
  ctaText,
  ctaAria,
}: {
  dogAlt: string;
  ctaText: string;
  ctaAria: string;
}) {
  return (
    <div className={styles.ctaContainer}>
      <DogIllustration dogAlt={dogAlt} />
      <Link href="/listings" aria-label={ctaAria} className={styles.ctaButton}>
        {ctaText}
      </Link>
    </div>
  );
}

export default async function PromoSection() {
  const t = await getTranslations("PromoSection");

  return (
    <Section
      padding="none"
      inner={false}
      max="site"
      className={styles.container}
      ariaLabel={t("titlePrefix")}
    >
      <PromoBackground backgroundAlt={t("backgroundAlt") as string} />

      <div className={styles.contentWrapper}>
        <h2 className={styles.title}>{t("titlePrefix")}</h2>

        <BigNumberDisplay number={PROMO_CONSTANTS.BIG_NUMBER} />

        <PromoDescription description={t("description")} />

        <CTASection
          dogAlt={t("dogAlt") as string}
          ctaText={t("cta")}
          ctaAria={t("ctaAria") as string}
        />
      </div>
    </Section>
  );
}
