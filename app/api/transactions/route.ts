// app/api/transactions/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: Ambil semua transaksi
export async function GET() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST: Simpan transaksi baru
export async function POST(req: Request) {
  const body = await req.json()
  const transactions = Array.isArray(body) ? body : [body]

  const { data, error } = await supabase
    .from('transactions')
    .insert(transactions)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// DELETE: Hapus transaksi by ID
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}