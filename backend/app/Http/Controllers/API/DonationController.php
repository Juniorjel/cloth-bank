<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DonationItem;
use App\Models\DonationItemImage;
use App\Repositories\Interfaces\DonationRepositoryInterface;
use App\Mail\ThankYouMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class DonationController extends Controller
{
    protected $donationRepo;

    public function __construct(DonationRepositoryInterface $donationRepo)
    {
        $this->donationRepo = $donationRepo;
    }

    public function index(Request $request)
    {
        $user    = $request->user();
        $filters = $request->only(['campaign_id', 'status']);
        if ($user->isAgent()) {
            $filters['agent_id'] = $user->id;
        }
        return response()->json($this->donationRepo->all($filters));
    }

    public function show($id)
    {
        return response()->json($this->donationRepo->find($id));
    }

    // POST /api/donations — public, multipart/form-data
    // items[0][cloth_type_id], items[0][quantity], items[0][note]?
    // items[0][images][]  (optional image files)
    public function store(Request $request)
    {
        $request->validate([
            'campaign_id'           => 'required|exists:campaigns,id',
            'donor_name'            => 'required|string|max:255',
            'donor_phone'           => 'required|string|max:20',
            'donor_email'           => 'required|email',
            'collection_type'       => 'required|in:pickup,drop',
            'latitude'              => 'nullable|numeric',
            'longitude'             => 'nullable|numeric',
            'address'               => 'nullable|string|max:500',
            'items'                 => 'required|array|min:1',
            'items.*.cloth_type_id' => 'required|exists:cloth_types,id',
            'items.*.quantity'      => 'required|integer|min:1',
            'items.*.note'          => 'nullable|string|max:500',
            'items.*.images'        => 'nullable|array',
            'items.*.images.*'      => 'image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        DB::beginTransaction();
        try {
            $donation = $this->donationRepo->create([
                'campaign_id'     => $request->campaign_id,
                'donor_name'      => $request->donor_name,
                'donor_phone'     => $request->donor_phone,
                'donor_email'     => $request->donor_email,
                'collection_type' => $request->collection_type,
                'latitude'        => $request->latitude,
                'longitude'       => $request->longitude,
                'address'         => $request->address,
                'status'          => 'pending',
            ]);

            foreach ($request->items as $index => $itemData) {
                $item = DonationItem::create([
                    'donation_id'   => $donation->id,
                    'cloth_type_id' => $itemData['cloth_type_id'],
                    'quantity'      => $itemData['quantity'],
                    'note'          => $itemData['note'] ?? null,
                ]);

                $images = $request->file("items.{$index}.images") ?? [];
                foreach ($images as $imageFile) {
                    $path = $imageFile->store("donations/{$donation->id}/item_{$item->id}", 'public');
                    DonationItemImage::create([
                        'donation_item_id' => $item->id,
                        'path'             => $path,
                        'url'              => Storage::url($path),
                    ]);
                }
            }

            DB::commit();
            $donation->load(['items.clothType', 'items.images', 'campaign']);

            return response()->json([
                'message'  => 'Donation submitted successfully!',
                'donation' => $donation,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Submission failed: ' . $e->getMessage()], 500);
        }
    }

    public function assign(Request $request, $id)
    {
        $data = $request->validate(['agent_id' => 'required|exists:users,id']);
        $donation = $this->donationRepo->update($id, [
            'agent_id' => $data['agent_id'],
            'status'   => 'assigned',
        ]);
        return response()->json($donation);
    }

    public function markPickedUp(Request $request, $id)
    {
        $donation = $this->donationRepo->find($id);
        if ($request->user()->isAgent() && $donation->agent_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($this->donationRepo->update($id, [
            'status'       => 'picked_up',
            'picked_up_at' => now(),
        ]));
    }

    public function markDelivered(Request $request, $id)
    {
        $donation = $this->donationRepo->find($id);
        if ($request->user()->isAgent() && $donation->agent_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($this->donationRepo->update($id, [
            'status'       => 'delivered',
            'delivered_at' => now(),
        ]));
    }

    public function verify(Request $request, $id)
    {
        $data = $request->validate(['verified_quantity' => 'required|integer|min:0']);
        $donation = $this->donationRepo->update($id, [
            'status'            => 'verified',
            'verified_quantity' => $data['verified_quantity'],
            'verified_at'       => now(),
        ]);
        try {
            Mail::to($donation->donor_email)->send(new ThankYouMail($donation));
        } catch (\Exception $e) {
            \Log::error('Thank you email failed: ' . $e->getMessage());
        }
        return response()->json($donation);
    }

    public function stats()
    {
        return response()->json($this->donationRepo->getStats());
    }

    public function agentPickups(Request $request)
    {
        return response()->json($this->donationRepo->getByAgent($request->user()->id));
    }
}
