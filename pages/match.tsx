import React, { useEffect } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Head from 'next/head';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

import { analyze } from '@/api/analyze';
import { useAnalyzeStore } from '@/store/analyze';

const schema = yup.object({
  experience: yup.string().required('Experience is required'),
  jd: yup.string().required('JD is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function Match() {
  const { t } = useTranslation('common');
  const {
    result,
    unlocked,
    feedback,
    isAnalyzing,
    setResult,
    setUnlocked,
    setFeedback,
    setIsAnalyzing,
  } = useAnalyzeStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const savedFeedback = localStorage.getItem('hire-or-not-feedback');
    if (savedFeedback) {
      setFeedback(JSON.parse(savedFeedback));
    }
  }, [setFeedback]);

  const onSubmit = async (data: FormData) => {
    setIsAnalyzing(true);
    setResult(null);
    setUnlocked(false);
    try {
      const res = await analyze(data.experience, data.jd);
      setResult(res);
    } catch (error) {
      console.error(error);
      alert('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFeedback = (type: 'applied' | 'interview' | 'no-interview') => {
    let newFeedback = { ...feedback };
    if (type === 'applied') {
      newFeedback.applied = true;
    } else if (type === 'interview') {
      newFeedback.interviewStatus = 'got';
    } else if (type === 'no-interview') {
      newFeedback.interviewStatus = 'failed';
    }
    setFeedback(newFeedback);
    localStorage.setItem('hire-or-not-feedback', JSON.stringify(newFeedback));
  };

  return (
    <div className="min-h-screen bg-page-bg text-text py-12 px-4 md:px-6">
      <Head>
        <title>{t('match_title')} - {t('site_name')}</title>
      </Head>

      <main className="max-w-3xl mx-auto space-y-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            {t('back_to_home')}
          </Link>
          <h1 className="text-xl font-bold text-primary">{t('match_title')}</h1>
          <div className="w-20"></div> {/* Spacer */}
        </header>

        {/* Input Form */}
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="card space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                {t('experience_label')}
              </label>
              <textarea
                {...register('experience')}
                className="input-field w-full h-48 resize-none text-sm"
                placeholder={t('experience_placeholder')}
              />
              {errors.experience && <p className="text-red-500 text-xs font-medium">{errors.experience.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                {t('jd_label')}
              </label>
              <textarea
                {...register('jd')}
                className="input-field w-full h-48 resize-none text-sm"
                placeholder={t('jd_placeholder')}
              />
              {errors.jd && <p className="text-red-500 text-xs font-medium">{errors.jd.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="btn-accent w-full text-base py-4 shadow-lg hover:shadow-xl transform active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('analyzing')}
              </span>
            ) : t('analyze_button')}
          </button>
        </form>

        {/* Results Area */}
        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="card border-t-4 border-primary">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {t('judgment_title')}
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed font-bold">{result.summary}</p>
              </section>

              <section className="card border-t-4 border-red-500">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  {t('problems_title')}
                </h2>
                <ul className="space-y-3">
                  {result.problems.map((p, i) => (
                    <li key={i} className="text-sm text-text-secondary flex gap-2">
                      <span className="text-red-500 font-bold">!</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="card border-t-4 border-success relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                 <button 
                  onClick={() => {
                    navigator.clipboard.writeText(result.rewrite);
                    alert(t('copy_success'));
                  }}
                  className="p-2 text-text-muted hover:text-success transition-colors cursor-pointer"
                  title="Copy"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </button>
              </div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-success">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                {t('rewrite_title')}
              </h2>
              <div className="bg-success/5 p-4 rounded-md border border-success/10 prose prose-sm max-w-none">
                <ReactMarkdown>{result.rewrite}</ReactMarkdown>
              </div>
            </section>

            {/* Feedback Buttons */}
            <section className="flex flex-col items-center gap-4 pt-6 border-t border-border">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">反馈与结果</span>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => handleFeedback('applied')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                    feedback?.applied 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-white text-text-secondary border border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  {t('feedback_applied')}
                </button>
                <button
                  onClick={() => handleFeedback('interview')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                    feedback?.interviewStatus === 'got' 
                      ? 'bg-success text-white shadow-md' 
                      : 'bg-white text-text-secondary border border-border hover:border-success hover:text-success'
                  }`}
                >
                  {t('feedback_interview')}
                </button>
                <button
                  onClick={() => handleFeedback('no-interview')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                    feedback?.interviewStatus === 'failed' 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'bg-white text-text-secondary border border-border hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  {t('feedback_no_interview')}
                </button>
              </div>
            </section>
          </div>
        )}
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
