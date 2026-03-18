import React, { useState, useRef } from 'react';
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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const schema = yup.object({
  targetPosition: yup.string().required('Target position is required'),
  experience: yup.string().required('Experience is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function Resume() {
  const { t } = useTranslation('common');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [resumeResult, setResumeResult] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const exportToPDF = async () => {
    if (!resumeRef.current) return;
    setIsExporting(true);
    try {
      const element = resumeRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          // html2canvas does not support oklch colors (Tailwind 4 default)
          // We must replace all oklch occurrences in the cloned document

          // 1. Process all stylesheets
          const sheets = clonedDoc.styleSheets;
          for (let i = 0; i < sheets.length; i++) {
            try {
              const rules = sheets[i].cssRules;
              for (let j = 0; j < rules.length; j++) {
                const rule = rules[j] as CSSStyleRule;
                if (rule.style && rule.style.cssText.includes('oklch')) {
                  // Replace oklch with hex in the entire rule text
                  let newCssText = rule.style.cssText.replace(/oklch\([^)]+\)/g, '#1e293b');
                  rule.style.cssText = newCssText;
                }
              }
            } catch (e) {
              // Some stylesheets might be cross-origin and inaccessible
              console.warn('Could not access stylesheet:', e);
            }
          }

          // 2. Handle all elements specifically for inline styles and computed variables
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            
            // Fix inline styles
            if (el.style.cssText.includes('oklch')) {
              el.style.cssText = el.style.cssText.replace(/oklch\([^)]+\)/g, '#1e293b');
            }

            const style = clonedDoc.defaultView?.getComputedStyle(el);
            if (style) {
              const colorProps = [
                'color', 'background-color', 'border-color', 
                'fill', 'stroke', 'outline-color', 'text-decoration-color'
              ];

              colorProps.forEach(prop => {
                const val = style.getPropertyValue(prop);
                if (val && val.includes('oklch')) {
                  let fallback = '#1e293b';
                  if (prop === 'background-color') fallback = 'transparent';
                  if (prop === 'border-color') fallback = '#e2e8f0';
                  if (prop.includes('fill') || prop.includes('stroke')) fallback = '#2563eb';
                  el.style.setProperty(prop, fallback, 'important');
                }
              });
            }
          }

          // 3. Special overrides for the resume content to look professional
          const resumeContainer = clonedDoc.querySelector('.prose');
          if (resumeContainer) {
            const container = resumeContainer as HTMLElement;
            container.style.setProperty('color', '#1e293b', 'important');
            container.style.setProperty('background-color', '#ffffff', 'important');
            container.style.setProperty('width', '100%', 'important');
            container.style.setProperty('max-width', 'none', 'important');
            container.style.setProperty('padding', '20px', 'important');
            container.style.setProperty('margin', '0', 'important');
            container.style.setProperty('font-family', 'Arial, sans-serif', 'important');
            
            // Fix all children in the prose container
            const proseChildren = resumeContainer.querySelectorAll('*');
            proseChildren.forEach((child) => {
              const el = child as HTMLElement;
              const tag = el.tagName.toLowerCase();
              el.style.setProperty('font-family', 'Arial, sans-serif', 'important');
              if (['h1', 'h2', 'h3', 'h4'].includes(tag)) {
                el.style.setProperty('color', '#2563eb', 'important');
                el.style.setProperty('margin-top', '1.5em', 'important');
                el.style.setProperty('margin-bottom', '0.5em', 'important');
              } else if (tag === 'a') {
                el.style.setProperty('color', '#2563eb', 'important');
                el.style.setProperty('text-decoration', 'underline', 'important');
              } else if (tag === 'p') {
                el.style.setProperty('margin-bottom', '1em', 'important');
                el.style.setProperty('line-height', '1.6', 'important');
              } else if (tag === 'ul' || tag === 'ol') {
                el.style.setProperty('margin-left', '1.5em', 'important');
                el.style.setProperty('margin-bottom', '1em', 'important');
              }
              el.style.setProperty('background-color', 'transparent', 'important');
              el.style.setProperty('border-color', '#e2e8f0', 'important');
            });
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate how many pages we need
      // We want to maintain the aspect ratio but fit the width to PDF
      const scale = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * scale;
      
      let heightLeft = scaledHeight;
      let position = 0;
      let page = 1;

      // Add the first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;

      // Add subsequent pages if needed
      while (heightLeft > 0) {
        position = heightLeft - scaledHeight; // Move the image up
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
        page++;
      }
      
      pdf.save(`resume-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

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
              <div className="flex items-center gap-4">
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
                <button 
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="text-accent hover:underline text-sm font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('exporting')}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      {t('export_pdf')}
                    </>
                  )}
                </button>
              </div>
            </div>
            <div ref={resumeRef} className="bg-white p-8 rounded-md border border-border prose prose-sm max-w-none prose-headings:text-primary prose-a:text-primary">
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
