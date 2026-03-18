import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Head from 'next/head';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { generateResume } from '@/api/resume';
import { getRemainingUsage, incrementUsage, isUsageLimitReached } from '@/utils/usageLimit';

const schema = yup.object({
  targetPosition: yup.string().required('Target position is required'),
  experience: yup.string().required('Experience is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function Resume() {
  const { t } = useTranslation('common');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeResult, setResumeResult] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (isUsageLimitReached()) {
      alert(t('usage_limit_reached'));
      return;
    }

    setIsGenerating(true);
    setResumeResult(null);
    try {
      const result = await generateResume(data);
      setResumeResult(result.content);
      incrementUsage();
    } catch (error) {
      console.error(error);
      alert('Failed to generate resume');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg text-text py-12 px-4 md:px-6">
      <Head>
        <title>{t('resume_title')} - {t('site_name')}</title>
      </Head>

      <main className="max-w-3xl mx-auto space-y-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            {t('back_to_home')}
          </Link>
          <h1 className="text-xl font-bold text-accent">{t('resume_title')}</h1>
          <div className="w-20"></div>
        </header>

        {/* Input Form */}
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="card space-y-6"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                {t('target_position_label')}
              </label>
              <input
                {...register('targetPosition')}
                className="input-field w-full text-sm"
                placeholder={t('target_position_placeholder')}
              />
              {errors.targetPosition && <p className="text-red-500 text-xs font-medium">{errors.targetPosition.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                {t('experience_label')}
              </label>
              <textarea
                {...register('experience')}
                className="input-field w-full h-64 resize-none text-sm"
                placeholder={t('experience_placeholder')}
              />
              {errors.experience && <p className="text-red-500 text-xs font-medium">{errors.experience.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating || isUsageLimitReached()}
            className="btn-accent w-full text-base py-4 shadow-lg hover:shadow-xl transform active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all cursor-pointer"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('generating')}
              </span>
            ) : isUsageLimitReached() ? t('usage_limit_reached') : t('generate_resume_button')}
          </button>
          <p className="text-center text-xs text-text-muted">
            {t('remaining_usage', { count: getRemainingUsage() })}
          </p>
        </form>

        {/* Step 4: Resume Result (Simple Placeholder for now) */}
        {resumeResult && (
          <section className="card space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-bold text-accent">{t('resume_result_title')}</h2>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(resumeResult);
                  alert(t('copy_success'));
                }}
                className="text-primary hover:underline text-sm font-medium flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                {t('copy_resume')}
              </button>
            </div>
            <div className="bg-white p-8 rounded-md border border-border prose prose-sm max-w-none prose-headings:text-primary prose-a:text-primary">
              <ReactMarkdown>
                {resumeResult}
              </ReactMarkdown>
            </div>
          </section>
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
