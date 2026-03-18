import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-page-bg text-text py-12 px-4 md:px-6 flex flex-col items-center justify-center">
      <Head>
        <title>{t('site_name')}</title>
      </Head>

      <main className="max-w-4xl mx-auto text-center space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary tracking-tight">
            {t('site_name')}
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto">
            {t('site_description')}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mx-auto">
          {/* Match Card */}
          <Link href="/match" className="group">
            <div className="card h-full border-2 border-transparent hover:border-primary transition-all hover:shadow-xl transform hover:-translate-y-1 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold">{t('match_title')}</h2>
              <p className="text-text-secondary text-sm">
                {t('match_description')}
              </p>
              <span className="text-primary font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                {t('get_started')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </span>
            </div>
          </Link>

          {/* Resume Card */}
          <Link href="/resume" className="group">
            <div className="card h-full border-2 border-transparent hover:border-accent transition-all hover:shadow-xl transform hover:-translate-y-1 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold">{t('resume_title')}</h2>
              <p className="text-text-secondary text-sm">
                {t('resume_description')}
              </p>
              <span className="text-accent font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                {t('get_started')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </main>

      <footer className="mt-20 text-center text-text-muted text-xs">
        <p>&copy; 2026 Hire or Not. All rights reserved.</p>
      </footer>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'zh', ['common'])),
  },
});
